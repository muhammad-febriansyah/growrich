<?php

use App\Enums\Mlm\PackageType;
use App\Models\MemberProfile;
use App\Models\RegistrationPin;
use App\Models\RewardPointLedger;
use App\Models\User;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);
    Mail::fake();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function rpMakeSponsor(PackageType $package = PackageType::Platinum): array
{
    $sponsor = User::factory()->create(['role' => 'member']);
    $profile = MemberProfile::factory()->create([
        'user_id' => $sponsor->id,
        'package_type' => $package->value,
        'package_status' => 'active',
        'left_rp_total' => 0,
        'right_rp_total' => 0,
    ]);

    return ['user' => $sponsor, 'profile' => $profile];
}

function rpMakePin(PackageType $package, int $assignedTo): RegistrationPin
{
    return RegistrationPin::factory()->forPackage($package)->create(['assigned_to' => $assignedTo]);
}

function rpRegisterPayload(RegistrationPin $pin, int $parentId, string $leg, string $email): array
{
    return [
        'pin_code' => $pin->pin_code,
        'name' => 'Test Member',
        'email' => $email,
        'phone' => '081234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'parent_id' => $parentId,
        'leg_position' => $leg,
        'birth_date' => '1990-01-01',
        'birth_place' => 'Jakarta',
        'gender' => 'Laki-laki',
        'marital_status' => 'Belum Menikah',
        'nationality' => 'Indonesia',
        'id_number' => '3201010101900001',
        'address' => 'Jl. Test No. 1',
        'province' => 'Jawa Barat',
        'city' => 'Bandung',
        'district' => 'Coblong',
        'village' => 'Dago',
        'postal_code' => '40135',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Test Member',
        'beneficiary_name' => 'Ahli Waris',
        'beneficiary_relationship' => 'Orang Tua',
        'beneficiary_id_number' => '3201010101900002',
        'beneficiary_phone' => '081234567891',
    ];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

it('silver_registration_does_not_add_rp_to_ancestors', function () {
    ['user' => $sponsor, 'profile' => $sponsorProfile] = rpMakeSponsor(PackageType::Platinum);
    $pin = rpMakePin(PackageType::Silver, $sponsor->id);

    $this->post('/register', rpRegisterPayload($pin, $sponsorProfile->id, 'left', 'silver@test.com'));

    expect($sponsorProfile->fresh()->left_rp_total)->toBe(0);
    expect($sponsorProfile->fresh()->right_rp_total)->toBe(0);
    expect(RewardPointLedger::where('member_profile_id', $sponsorProfile->id)->count())->toBe(0);
});

it('gold_registration_adds_1_rp_to_parent', function () {
    ['user' => $sponsor, 'profile' => $sponsorProfile] = rpMakeSponsor(PackageType::Platinum);
    $pin = rpMakePin(PackageType::Gold, $sponsor->id);

    $this->post('/register', rpRegisterPayload($pin, $sponsorProfile->id, 'left', 'gold@test.com'));

    expect($sponsorProfile->fresh()->left_rp_total)->toBe(1);
    expect($sponsorProfile->fresh()->right_rp_total)->toBe(0);
    expect(RewardPointLedger::where('member_profile_id', $sponsorProfile->id)->count())->toBe(1);
});

it('platinum_registration_adds_2_rp_to_parent', function () {
    ['user' => $sponsor, 'profile' => $sponsorProfile] = rpMakeSponsor(PackageType::Platinum);
    $pin = rpMakePin(PackageType::Platinum, $sponsor->id);

    $this->post('/register', rpRegisterPayload($pin, $sponsorProfile->id, 'right', 'plat@test.com'));

    expect($sponsorProfile->fresh()->right_rp_total)->toBe(2);
    expect($sponsorProfile->fresh()->left_rp_total)->toBe(0);
    expect(RewardPointLedger::where('member_profile_id', $sponsorProfile->id)->count())->toBe(1);
});

it('rp_propagates_to_all_ancestors_in_binary_tree', function () {
    // Grandparent → Parent (left) → New member (left)
    ['user' => $grandparent, 'profile' => $gpProfile] = rpMakeSponsor(PackageType::Platinum);
    ['user' => $parent, 'profile' => $parentProfile] = rpMakeSponsor(PackageType::Platinum);

    // Set parent as left child of grandparent
    $gpProfile->update(['left_child_id' => $parentProfile->id]);
    $parentProfile->update(['parent_id' => $gpProfile->id, 'leg_position' => 'left']);

    $pin = rpMakePin(PackageType::Gold, $parent->id);

    $this->post('/register', rpRegisterPayload($pin, $parentProfile->id, 'left', 'gold2@test.com'));

    // Parent: left_rp += 1
    expect($parentProfile->fresh()->left_rp_total)->toBe(1);
    // Grandparent: left_rp += 1 (parent is in grandparent's left subtree)
    expect($gpProfile->fresh()->left_rp_total)->toBe(1);

    expect(RewardPointLedger::where('member_profile_id', $parentProfile->id)->count())->toBe(1);
    expect(RewardPointLedger::where('member_profile_id', $gpProfile->id)->count())->toBe(1);
});

it('upgrade_propagates_rp_delta_to_ancestors', function () {
    ['user' => $sponsor, 'profile' => $sponsorProfile] = rpMakeSponsor(PackageType::Platinum);

    // Create a Silver member under sponsor
    $member = User::factory()->create(['role' => 'member']);
    $memberProfile = MemberProfile::factory()->create([
        'user_id' => $member->id,
        'package_type' => 'Silver',
        'package_status' => 'active',
        'parent_id' => $sponsorProfile->id,
        'leg_position' => 'left',
    ]);
    $sponsorProfile->update(['left_child_id' => $memberProfile->id]);

    // Upgrade Silver → Gold (delta RP = 1)
    $upgradePin = RegistrationPin::factory()->create([
        'pin_code' => 'UPIN-TEST0001',
        'package_type' => 'Gold',
        'upgrade_from' => 'Silver',
        'status' => 'available',
        'assigned_to' => $member->id,
    ]);

    actingAs($member)->post('/member/upgrade', ['pin_code' => $upgradePin->pin_code]);

    expect($sponsorProfile->fresh()->left_rp_total)->toBe(1);
    expect(RewardPointLedger::where('member_profile_id', $sponsorProfile->id)
        ->where('reason', 'upgrade')
        ->count()
    )->toBe(1);
});
