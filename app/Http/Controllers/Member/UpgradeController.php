<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\PackageType;
use App\Http\Controllers\Controller;
use App\Models\PackageUpgradeRequest;
use App\Models\RegistrationPin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UpgradeController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return redirect()->route('dashboard')->with('error', 'Profil member tidak ditemukan.');
        }

        $currentPackage = $profile->package_type instanceof PackageType
            ? $profile->package_type
            : PackageType::from($profile->package_type);

        $nextPackage = $currentPackage->next();

        // Available PINs assigned to this user for upgrade
        $availablePins = $nextPackage
            ? RegistrationPin::where('assigned_to', $user->id)
                ->where('status', 'available')
                ->where('package_type', $nextPackage->value)
                ->get(['id', 'pin_code', 'package_type'])
            : collect();

        // Pending upgrade request
        $pendingRequest = PackageUpgradeRequest::where('member_profile_id', $profile->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        return Inertia::render('member/upgrade/index', [
            'currentPackage' => $currentPackage->value,
            'nextPackage' => $nextPackage?->value,
            'upgradePrice' => $currentPackage->upgradePrice(),
            'availablePins' => $availablePins,
            'pendingRequest' => $pendingRequest,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return back()->with('error', 'Profil member tidak ditemukan.');
        }

        $currentPackage = $profile->package_type instanceof PackageType
            ? $profile->package_type
            : PackageType::from($profile->package_type);

        $nextPackage = $currentPackage->next();

        if (! $nextPackage) {
            return back()->with('error', 'Paket Anda sudah berada di level tertinggi (Platinum).');
        }

        // Check no pending request
        $hasPending = PackageUpgradeRequest::where('member_profile_id', $profile->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return back()->with('error', 'Anda sudah memiliki permintaan upgrade yang sedang menunggu persetujuan.');
        }

        $request->validate([
            'pin_code' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        PackageUpgradeRequest::create([
            'member_profile_id' => $profile->id,
            'current_package' => $currentPackage->value,
            'requested_package' => $nextPackage->value,
            'pin_code' => $request->pin_code,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Permintaan upgrade paket berhasil dikirim. Menunggu persetujuan admin.');
    }
}
