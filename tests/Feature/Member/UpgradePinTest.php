<?php

use App\Enums\Mlm\PackageType;
use App\Models\MemberProfile;
use App\Models\PackageUpgradeRequest;
use App\Models\RegistrationPin;
use App\Models\User;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeUpgradePin(string $upgradeFrom, string $packageType, int $assignedTo, string $status = 'available'): RegistrationPin
{
    return RegistrationPin::factory()->create([
        'pin_code' => 'UPIN-'.strtoupper(str_pad((string) random_int(1, 99999999), 8, '0', STR_PAD_LEFT)),
        'package_type' => $packageType,
        'upgrade_from' => $upgradeFrom,
        'status' => $status,
        'assigned_to' => $assignedTo,
        'price' => 500000,
    ]);
}

function makeMemberWithPackage(PackageType $package): User
{
    $user = User::factory()->create(['role' => 'member']);
    MemberProfile::factory()->create([
        'user_id' => $user->id,
        'package_type' => $package->value,
    ]);

    return $user;
}

// ── Tests ──────────────────────────────────────────────────────────────────────

it('upgrade_pin_can_be_used_to_upgrade_package', function () {
    $member = makeMemberWithPackage(PackageType::Silver);
    $pin = makeUpgradePin('Silver', 'Gold', $member->id);

    $response = actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($member->fresh()->memberProfile->package_type->value)->toBe('Gold');

    $pin->refresh();
    expect($pin->status)->toBe('used');
    expect($pin->used_by)->toBe($member->id);

    expect(PackageUpgradeRequest::where('member_profile_id', $member->memberProfile->id)
        ->where('status', 'approved')
        ->where('requested_package', 'Gold')
        ->exists()
    )->toBeTrue();
});

it('upgrade_pin_validates_from_package', function () {
    // Silver member cannot use a Gold → Platinum PIN
    $member = makeMemberWithPackage(PackageType::Silver);
    $pin = makeUpgradePin('Gold', 'Platinum', $member->id);

    $response = actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $response->assertSessionHasErrors('pin_code');
    expect($member->fresh()->memberProfile->package_type->value)->toBe('Silver');
    expect($pin->fresh()->status)->toBe('available');
});

it('upgrade_pin_must_be_assigned_to_member', function () {
    $member = makeMemberWithPackage(PackageType::Silver);
    $otherMember = makeMemberWithPackage(PackageType::Silver);
    $pin = makeUpgradePin('Silver', 'Gold', $otherMember->id);

    $response = actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $response->assertSessionHasErrors('pin_code');
    expect($member->fresh()->memberProfile->package_type->value)->toBe('Silver');
    expect($pin->fresh()->status)->toBe('available');
});

it('upgrade_pin_must_be_available', function () {
    $member = makeMemberWithPackage(PackageType::Silver);
    $pin = makeUpgradePin('Silver', 'Gold', $member->id, 'used');

    $response = actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $response->assertSessionHasErrors('pin_code');
    expect($member->fresh()->memberProfile->package_type->value)->toBe('Silver');
});

it('upgrade_pin_silver_to_platinum_works', function () {
    $member = makeMemberWithPackage(PackageType::Silver);
    $pin = makeUpgradePin('Silver', 'Platinum', $member->id);

    $response = actingAs($member)->post('/member/upgrade', ['pin_code' => $pin->pin_code]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($member->fresh()->memberProfile->package_type->value)->toBe('Platinum');
    expect($pin->fresh()->status)->toBe('used');

    expect(PackageUpgradeRequest::where('member_profile_id', $member->memberProfile->id)
        ->where('status', 'approved')
        ->where('requested_package', 'Platinum')
        ->exists()
    )->toBeTrue();
});

it('upgrade_page_shows_correct_data_for_member', function () {
    $member = makeMemberWithPackage(PackageType::Silver);
    makeUpgradePin('Silver', 'Gold', $member->id);

    $response = actingAs($member)->get('/member/upgrade');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('member/upgrade/index')
        ->where('currentPackage', 'Silver')
        ->has('possibleUpgrades')
        ->has('availableUpgradePins', 1)
    );
});

it('upgrade_requires_pin_code', function () {
    $member = makeMemberWithPackage(PackageType::Silver);

    $response = actingAs($member)->post('/member/upgrade', ['pin_code' => '']);

    $response->assertSessionHasErrors('pin_code');
});

it('platinum_member_has_no_possible_upgrades', function () {
    $member = makeMemberWithPackage(PackageType::Platinum);

    $response = actingAs($member)->get('/member/upgrade');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('member/upgrade/index')
        ->where('currentPackage', 'Platinum')
        ->has('possibleUpgrades', 0)
        ->has('availableUpgradePins', 0)
    );
});
