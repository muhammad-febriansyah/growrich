<?php

use App\Enums\Mlm\PackageType;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Models\Wallet;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);
    Mail::fake();
});

function ppUpgradeMakeTree(): array
{
    // grandparent (Platinum, active)
    $gp = User::factory()->create(['role' => 'member']);
    $gpProfile = MemberProfile::factory()->platinum()->create([
        'user_id' => $gp->id,
        'package_status' => 'active',
    ]);
    Wallet::factory()->for($gp)->create();

    // parent (Platinum, active) — left child of grandparent
    $parent = User::factory()->create(['role' => 'member']);
    $parentProfile = MemberProfile::factory()->platinum()->create([
        'user_id' => $parent->id,
        'package_status' => 'active',
        'parent_id' => $gpProfile->id,
        'leg_position' => 'left',
    ]);
    $gpProfile->update(['left_child_id' => $parentProfile->id]);
    Wallet::factory()->for($parent)->create();

    // member (Silver, active) — left child of parent
    $member = User::factory()->create(['role' => 'member']);
    $memberProfile = MemberProfile::factory()->create([
        'user_id' => $member->id,
        'package_type' => PackageType::Silver->value,
        'package_status' => 'active',
        'parent_id' => $parentProfile->id,
        'leg_position' => 'left',
    ]);
    $parentProfile->update(['left_child_id' => $memberProfile->id]);
    Wallet::factory()->for($member)->create();

    return compact('gp', 'gpProfile', 'parent', 'parentProfile', 'member', 'memberProfile');
}

function ppUpgradePin(PackageType $to, PackageType $from, int $assignedTo): RegistrationPin
{
    return RegistrationPin::factory()->create([
        'pin_code' => 'UPIN-'.strtoupper(str_pad((string) random_int(1, 99999999), 8, '0', STR_PAD_LEFT)),
        'package_type' => $to->value,
        'upgrade_from' => $from->value,
        'status' => 'available',
        'assigned_to' => $assignedTo,
        'price' => 500000,
    ]);
}

it('pp_delta_propagates_to_parent_on_silver_to_gold_upgrade', function () {
    ['member' => $member, 'parentProfile' => $parentProfile] = ppUpgradeMakeTree();

    $pin = ppUpgradePin(PackageType::Gold, PackageType::Silver, $member->id);

    actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $parentProfile->refresh();

    // PP delta = Gold(2) - Silver(1) = 1, propagated to parent's left leg
    expect($parentProfile->left_pp_cumulative)->toBe(1);
});

it('pp_delta_propagates_to_grandparent_on_silver_to_platinum_upgrade', function () {
    ['member' => $member, 'parentProfile' => $parentProfile, 'gpProfile' => $gpProfile] = ppUpgradeMakeTree();

    $pin = ppUpgradePin(PackageType::Platinum, PackageType::Silver, $member->id);

    actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $parentProfile->refresh();
    $gpProfile->refresh();

    // PP delta = Platinum(3) - Silver(1) = 2
    expect($parentProfile->left_pp_cumulative)->toBe(2);
    expect($gpProfile->left_pp_cumulative)->toBe(2);
});

it('pp_upgrade_ledger_entry_is_created_with_reason_upgrade', function () {
    ['member' => $member, 'parentProfile' => $parentProfile] = ppUpgradeMakeTree();

    $pin = ppUpgradePin(PackageType::Gold, PackageType::Silver, $member->id);

    actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $ledger = PairingPointLedger::where('member_profile_id', $parentProfile->id)
        ->where('reason', 'upgrade')
        ->first();

    expect($ledger)->not->toBeNull();
    expect($ledger->points)->toBe(1);
    expect($ledger->leg->value)->toBe('left');
});

it('pp_no_propagation_when_delta_is_zero_or_negative', function () {
    ['member' => $member, 'parentProfile' => $parentProfile] = ppUpgradeMakeTree();

    $before = $parentProfile->left_pp_cumulative;

    $service = app(\App\Services\BonusRunnerService::class);
    $service->propagateUpgradePairingPoints(
        $member->memberProfile,
        PackageType::Gold,
        PackageType::Silver  // lower — delta <= 0, nothing should happen
    );

    $parentProfile->refresh();
    expect((int) $parentProfile->left_pp_cumulative)->toBe((int) $before);
});
