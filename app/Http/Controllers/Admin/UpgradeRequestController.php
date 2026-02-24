<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\PackageType;
use App\Http\Controllers\Controller;
use App\Jobs\SendUpgradeApprovedEmail;
use App\Jobs\SendUpgradeRejectedEmail;
use App\Models\PackageUpgradeRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UpgradeRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PackageUpgradeRequest::with(['memberProfile.user', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('memberProfile.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $requests = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        $stats = [
            'pending' => PackageUpgradeRequest::where('status', 'pending')->count(),
            'approved' => PackageUpgradeRequest::where('status', 'approved')->count(),
            'rejected' => PackageUpgradeRequest::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/upgrades/index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
            'stats' => $stats,
        ]);
    }

    public function approve(PackageUpgradeRequest $upgradeRequest)
    {
        if (! $upgradeRequest->isPending()) {
            return back()->with('error', 'Hanya permintaan berstatus pending yang dapat disetujui.');
        }

        $profile = $upgradeRequest->memberProfile;

        // Generate new member_id with upgrade prefix (GU / PU)
        $requestedPackage = PackageType::from($upgradeRequest->requested_package);
        $upgradePrefix = match ($requestedPackage) {
            PackageType::Gold => 'GU',
            PackageType::Platinum => 'PU',
            default => null,
        };

        // Update the member's package and member_id
        $profile->update(['package_type' => $upgradeRequest->requested_package]);

        if ($upgradePrefix) {
            $profile->user->update([
                'member_id' => User::generateMemberId($upgradePrefix),
            ]);
        }

        $upgradeRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        SendUpgradeApprovedEmail::dispatch($upgradeRequest->load('memberProfile.user'));

        return back()->with('success', "Upgrade paket berhasil disetujui. Member sekarang menggunakan paket {$upgradeRequest->requested_package}.");
    }

    public function reject(Request $request, PackageUpgradeRequest $upgradeRequest)
    {
        if (! $upgradeRequest->isPending()) {
            return back()->with('error', 'Hanya permintaan berstatus pending yang dapat ditolak.');
        }

        $upgradeRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'notes' => $request->notes ?? $upgradeRequest->notes,
        ]);

        SendUpgradeRejectedEmail::dispatch($upgradeRequest->load('memberProfile.user'));

        return back()->with('success', 'Permintaan upgrade berhasil ditolak.');
    }
}
