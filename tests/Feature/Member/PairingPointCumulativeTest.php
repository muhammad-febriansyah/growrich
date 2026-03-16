<?php

use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Models\MemberProfile;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Models\Wallet;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

// ── Helpers ───────────────────────────────────────────────────────────────────

function cumulativeRegisterPayload(RegistrationPin $pin, string $leg, string $email): array
{
    return [
        'pin_code' => $pin->pin_code,
        'name' => 'New Member',
        'email' => $email,
        'phone' => '081234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
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
        'bank_account_name' => 'New Member',
        'beneficiary_name' => 'Ahli Waris',
        'beneficiary_relationship' => 'Orang Tua',
    ];
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);

    Mail::fake();

    $this->sponsor = User::factory()->create();
    $this->sponsorProfile = MemberProfile::factory()->platinum()->for($this->sponsor)->create();
    Wallet::factory()->for($this->sponsor)->create();
});

// ── PP Cumulative Tests ────────────────────────────────────────────────────────

it('pp_cumulative_increments_when_pp_propagates', function () {
    $pin = RegistrationPin::factory()->forPackage(PackageType::Silver)->create(['assigned_to' => $this->sponsor->id]);

    actingAs($this->sponsor)
        ->post('/member/register', cumulativeRegisterPayload($pin, 'left', 'new1@member.test'));

    $this->sponsorProfile->refresh();

    // pp_total has 1 (no pairing yet, only left leg)
    expect($this->sponsorProfile->left_pp_total)->toBe(1)
        ->and($this->sponsorProfile->right_pp_total)->toBe(0)
        // pp_cumulative must also be 1 (accumulative, never reset)
        ->and($this->sponsorProfile->left_pp_cumulative)->toBe(1)
        ->and($this->sponsorProfile->right_pp_cumulative)->toBe(0);
});

it('pp_cumulative_not_reset_after_pairing_consumes_pp_total', function () {
    // Pre-existing right-leg PP (simulating a previous registration)
    $this->sponsorProfile->update(['right_pp_total' => 1, 'right_pp_cumulative' => 1]);

    // Register on left leg → pair forms → pp_total resets, cumulative must NOT decrease
    $pin = RegistrationPin::factory()->forPackage(PackageType::Silver)->create(['assigned_to' => $this->sponsor->id]);

    actingAs($this->sponsor)
        ->post('/member/register', cumulativeRegisterPayload($pin, 'left', 'new1@member.test'));

    $this->sponsorProfile->refresh();

    // pp_total consumed by pairing
    expect($this->sponsorProfile->left_pp_total)->toBe(0)
        ->and($this->sponsorProfile->right_pp_total)->toBe(0);

    // pp_cumulative must remain accumulative — not reset after pairing
    expect($this->sponsorProfile->left_pp_cumulative)->toBe(1)
        ->and($this->sponsorProfile->right_pp_cumulative)->toBe(1);
});

it('career_level_uses_cumulative_pp_not_remaining_pp', function () {
    // Pre-set cumulative PP that meets CoreLoader threshold (25 each leg)
    // but pp_total is 0 (already consumed by previous pairings)
    $this->sponsorProfile->update([
        'left_pp_total' => 0,
        'right_pp_total' => 0,
        'left_pp_cumulative' => 24,
        'right_pp_cumulative' => 25,
        'career_level' => CareerLevel::Member->value,
    ]);

    // Register on left leg → left_pp_cumulative becomes 25, min(25,25) = 25 ≥ CoreLoader
    $pin = RegistrationPin::factory()->forPackage(PackageType::Silver)->create(['assigned_to' => $this->sponsor->id]);

    actingAs($this->sponsor)
        ->post('/member/register', cumulativeRegisterPayload($pin, 'left', 'new1@member.test'));

    $this->sponsorProfile->refresh();

    // Career level must advance based on cumulative PP, not the (zero) remaining pp_total
    expect($this->sponsorProfile->career_level->value)->toBe(CareerLevel::CoreLoader->value);
});

it('pp_cumulative_accumulates_across_multiple_registrations', function () {
    // 3 left registrations then 2 right: pairing will consume 2 pairs,
    // but cumulative must always grow
    foreach (range(1, 3) as $i) {
        $pin = RegistrationPin::factory()->forPackage(PackageType::Silver)->create(['assigned_to' => $this->sponsor->id]);
        actingAs($this->sponsor)->post('/member/register', cumulativeRegisterPayload($pin, 'left', "left{$i}@member.test"));
    }

    foreach (range(1, 2) as $i) {
        $pin = RegistrationPin::factory()->forPackage(PackageType::Silver)->create(['assigned_to' => $this->sponsor->id]);
        actingAs($this->sponsor)->post('/member/register', cumulativeRegisterPayload($pin, 'right', "right{$i}@member.test"));
    }

    $this->sponsorProfile->refresh();

    // 2 pairs consumed → left_pp_total = 1 (3-2), right_pp_total = 0 (2-2)
    // But cumulative must reflect all PP ever added
    expect($this->sponsorProfile->left_pp_cumulative)->toBe(3)
        ->and($this->sponsorProfile->right_pp_cumulative)->toBe(2);
});
