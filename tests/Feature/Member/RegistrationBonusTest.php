<?php

use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\PackageType;
use App\Mail\BonusAvailable;
use App\Mail\SponsorNewMemberRegistered;
use App\Mail\WelcomeNewMember;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeBonusPin(PackageType $package = PackageType::Silver, ?int $assignedTo = null): RegistrationPin
{
    return RegistrationPin::factory()->forPackage($package)->create(['assigned_to' => $assignedTo]);
}

function bonusRegisterPayload(RegistrationPin $pin, string $leg = 'left'): array
{
    return [
        'pin_code' => $pin->pin_code,
        'name' => 'New Bonus Member',
        'email' => 'newbonus@member.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'leg_position' => $leg,
    ];
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    Mail::fake();

    $this->sponsor = User::factory()->create();
    // Sponsor selalu Platinum agar bonus matrix bisa ditest secara deterministik
    $this->sponsorProfile = MemberProfile::factory()->platinum()->for($this->sponsor)->create();
    Wallet::factory()->for($this->sponsor)->create();
});

// ── Sponsor Bonus ─────────────────────────────────────────────────────────────

it('sponsor_bonus_is_created_after_registration', function () {
    // Sponsor=Platinum, New Member=Gold → min(3,2)×200k = 400k
    $pin = makeBonusPin(PackageType::Gold, $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin));

    $bonus = Bonus::where('member_profile_id', $this->sponsorProfile->id)
        ->where('bonus_type', BonusType::Sponsor->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(400_000)
        ->and($bonus->ewallet_amount)->toBe((int) ($bonus->amount * 0.2))
        ->and($bonus->cash_amount)->toBe($bonus->amount - $bonus->ewallet_amount)
        ->and($bonus->status->value)->toBe('Pending');
});

it('sponsor_bonus_amount_matches_package_type', function (PackageType $newMemberPackage, int $expectedBonus) {
    // Sponsor=Platinum, matrix: Silver=200k, Gold=400k, Platinum=600k
    $pin = makeBonusPin($newMemberPackage, $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', [
            'pin_code' => $pin->pin_code,
            'name' => 'Test Member',
            'email' => "test_{$newMemberPackage->value}@member.test",
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'leg_position' => 'left',
        ]);

    $bonus = Bonus::where('member_profile_id', $this->sponsorProfile->id)
        ->where('bonus_type', BonusType::Sponsor->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe($expectedBonus);
})->with([
    // Platinum sponsor × new member package → min(3, level) × 200k
    'Silver' => [PackageType::Silver, 200_000],
    'Gold' => [PackageType::Gold, 400_000],
    'Platinum' => [PackageType::Platinum, 600_000],
]);

// ── Pairing Points ────────────────────────────────────────────────────────────

it('pp_is_propagated_up_the_tree', function () {
    $pin = makeBonusPin(PackageType::Silver, $this->sponsor->id); // pairingPoint = 1

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left'));

    $this->sponsorProfile->refresh();

    expect($this->sponsorProfile->left_pp_total)->toBe(1);
});

it('pairing_point_ledger_entry_is_created', function () {
    $pin = makeBonusPin(PackageType::Silver, $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left'));

    $newUser = User::where('email', 'newbonus@member.test')->first();
    $newProfile = $newUser->memberProfile;

    $ledger = PairingPointLedger::where('member_profile_id', $this->sponsorProfile->id)
        ->where('leg', 'left')
        ->where('reason', 'registration')
        ->where('reference_id', $newProfile->id)
        ->first();

    expect($ledger)->not->toBeNull()
        ->and($ledger->points)->toBe(PackageType::Silver->pairingPoint())
        ->and($ledger->balance_after)->toBe($ledger->balance_before + $ledger->points);
});

it('pp_propagates_multiple_levels_up', function () {
    // grandparent → sponsor (left) → new member (left)
    $grandparent = User::factory()->create();
    $grandparentProfile = MemberProfile::factory()->for($grandparent)->create();
    Wallet::factory()->for($grandparent)->create();

    // Sponsor's profile is a child of grandparent on left leg
    $this->sponsorProfile->update([
        'parent_id' => $grandparentProfile->id,
        'leg_position' => 'left',
    ]);
    $grandparentProfile->update(['left_child_id' => $this->sponsorProfile->id]);

    $pin = makeBonusPin(PackageType::Gold, $this->sponsor->id); // pairingPoint = 2

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left'));

    $this->sponsorProfile->refresh();
    $grandparentProfile->refresh();

    expect($this->sponsorProfile->left_pp_total)->toBe(2)
        ->and($grandparentProfile->left_pp_total)->toBe(2);
});

// ── Emails ────────────────────────────────────────────────────────────────────

it('welcome_email_is_queued', function () {
    $pin = makeBonusPin(assignedTo: $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin));

    Mail::assertQueued(WelcomeNewMember::class, function (WelcomeNewMember $mail) {
        return $mail->hasTo('newbonus@member.test');
    });
});

it('sponsor_notification_email_is_queued', function () {
    $pin = makeBonusPin(assignedTo: $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin));

    Mail::assertQueued(SponsorNewMemberRegistered::class, function (SponsorNewMemberRegistered $mail) {
        return $mail->hasTo($this->sponsor->email);
    });
});

it('bonus_available_email_is_queued_for_sponsor', function () {
    $pin = makeBonusPin(assignedTo: $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin));

    Mail::assertQueued(BonusAvailable::class, function (BonusAvailable $mail) {
        return $mail->hasTo($this->sponsor->email);
    });
});
