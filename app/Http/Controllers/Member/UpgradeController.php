<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UpgradePinType;
use App\Http\Controllers\Controller;
use App\Models\PackageUpgradeRequest;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Services\BonusRunnerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpgradeController extends Controller
{
    public function __construct(private readonly BonusRunnerService $bonusRunnerService) {}

    public function index(): Response|RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return redirect()->route('dashboard')->with('error', 'Profil member tidak ditemukan.');
        }

        $currentPackage = $profile->package_type instanceof PackageType
            ? $profile->package_type
            : PackageType::from($profile->package_type);

        $possibleUpgrades = UpgradePinType::availableFor($currentPackage);

        // Find all upgrade PINs assigned to this user that match their current package
        $availableUpgradePins = RegistrationPin::where('assigned_to', $user->id)
            ->where('status', 'available')
            ->whereNotNull('upgrade_from')
            ->where('upgrade_from', $currentPackage->value)
            ->get(['id', 'pin_code', 'package_type', 'upgrade_from']);

        return Inertia::render('member/upgrade/index', [
            'currentPackage' => $currentPackage->value,
            'availableUpgradePins' => $availableUpgradePins,
            'possibleUpgrades' => collect($possibleUpgrades)->map(fn (UpgradePinType $u) => [
                'value' => $u->value,
                'label' => $u->label(),
                'fromPackage' => $u->fromPackage()->value,
                'toPackage' => $u->toPackage()->value,
                'price' => $u->price(),
            ])->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return back()->with('error', 'Profil member tidak ditemukan.');
        }

        $currentPackage = $profile->package_type instanceof PackageType
            ? $profile->package_type
            : PackageType::from($profile->package_type);

        $request->validate([
            'pin_code' => 'required|string',
        ], [
            'pin_code.required' => 'Kode PIN upgrade wajib diisi.',
        ]);

        $pin = RegistrationPin::where('pin_code', $request->pin_code)
            ->where('status', 'available')
            ->first();

        if (! $pin) {
            return back()->withErrors(['pin_code' => 'PIN tidak ditemukan atau sudah digunakan.']);
        }

        if (! $pin->isUpgradePin()) {
            return back()->withErrors(['pin_code' => 'PIN ini bukan PIN upgrade.']);
        }

        if ($pin->upgrade_from !== $currentPackage->value) {
            return back()->withErrors(['pin_code' => 'PIN ini tidak sesuai dengan paket Anda saat ini ('.$currentPackage->value.').']);
        }

        if ($pin->assigned_to !== $user->id) {
            return back()->withErrors(['pin_code' => 'PIN ini tidak ditugaskan untuk akun Anda.']);
        }

        $targetPackage = $pin->package_type instanceof PackageType
            ? $pin->package_type
            : PackageType::from($pin->package_type);

        // Apply upgrade
        $profile->update(['package_type' => $targetPackage->value]);

        $upgradePrefix = match ($targetPackage) {
            PackageType::Gold => 'GU',
            PackageType::Platinum => 'PU',
            default => null,
        };

        if ($upgradePrefix) {
            $user->update([
                'member_id' => User::generateMemberId($upgradePrefix),
            ]);
        }

        // Mark PIN as used
        $pin->update([
            'status' => 'used',
            'used_by' => $user->id,
        ]);

        // Record in PackageUpgradeRequest for history
        PackageUpgradeRequest::create([
            'member_profile_id' => $profile->id,
            'current_package' => $currentPackage->value,
            'requested_package' => $targetPackage->value,
            'pin_code' => $pin->pin_code,
            'status' => 'approved',
            'notes' => 'Upgrade otomatis via PIN upgrade.',
        ]);

        // Propagate Pairing Point delta up the binary tree
        $this->bonusRunnerService->propagateUpgradePairingPoints($profile, $currentPackage, $targetPackage);

        // Propagate Reward Point delta up the binary tree
        $this->bonusRunnerService->propagateUpgradeRewardPoints($profile, $currentPackage, $targetPackage);

        return back()->with('success', "Selamat! Paket Anda berhasil diupgrade ke {$targetPackage->value}.");
    }
}
