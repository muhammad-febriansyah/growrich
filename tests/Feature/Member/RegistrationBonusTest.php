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
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\actingAs;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeBonusPin(PackageType $package = PackageType::Silver, ?int $assignedTo = null): RegistrationPin
{
    return RegistrationPin::factory()->forPackage($package)->create(['assigned_to' => $assignedTo]);
}

function bonusRegisterPayload(RegistrationPin $pin, string $leg = 'left', string $email = 'newbonus@member.test'): array
{
    return [
        'pin_code' => $pin->pin_code,
        'name' => 'New Bonus Member',
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
        'bank_account_name' => 'New Bonus Member',
        'beneficiary_name' => 'Ahli Waris',
        'beneficiary_relationship' => 'Orang Tua',
    ];
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);

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
        ->post('/member/register', bonusRegisterPayload($pin, 'left', "test_{$newMemberPackage->value}@member.test"));

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

// ── Pass Up Sponsor Bonus ──────────────────────────────────────────────────────

it('silver_sponsor_recruiting_gold_creates_pass_up_bonus', function () {
    // Silver sponsor (sort=1), Gold new member (alokasi=400k), sponsor bonus=200k, sisa=200k
    $upline = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->gold()->for($upline)->create();
    Wallet::factory()->for($upline)->create();

    $silverSponsor = User::factory()->create(['sponsor_id' => $upline->id]);
    $silverProfile = MemberProfile::factory()->silver()->for($silverSponsor)->create();
    Wallet::factory()->for($silverSponsor)->create();

    $pin = makeBonusPin(PackageType::Gold, $silverSponsor->id);

    actingAs($silverSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'newgold@member.test'));

    $passUpBonus = \App\Models\Bonus::where('member_profile_id', $uplineProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($passUpBonus)->not->toBeNull()
        ->and($passUpBonus->amount)->toBe(200_000)
        ->and($passUpBonus->ewallet_amount)->toBe((int) (200_000 * 0.2))
        ->and($passUpBonus->cash_amount)->toBe(200_000 - (int) (200_000 * 0.2))
        ->and($passUpBonus->status->value)->toBe('Pending');
});

it('silver_sponsor_recruiting_platinum_creates_pass_up_bonus', function () {
    // Silver sponsor (sort=1), Platinum new member (alokasi=600k), sponsor bonus=200k, sisa=400k
    // Upline adalah Gold → capped ke max Gold pass-up = 200k
    $upline = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->gold()->for($upline)->create();
    Wallet::factory()->for($upline)->create();

    $silverSponsor = User::factory()->create(['sponsor_id' => $upline->id]);
    $silverProfile = MemberProfile::factory()->silver()->for($silverSponsor)->create();
    Wallet::factory()->for($silverSponsor)->create();

    $pin = makeBonusPin(PackageType::Platinum, $silverSponsor->id);

    actingAs($silverSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'newplatinum@member.test'));

    $passUpBonus = \App\Models\Bonus::where('member_profile_id', $uplineProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($passUpBonus)->not->toBeNull()
        ->and($passUpBonus->amount)->toBe(200_000);
});

it('gold_sponsor_recruiting_platinum_creates_pass_up_bonus', function () {
    // Gold sponsor (sort=2), Platinum new member (alokasi=600k), sponsor bonus=400k, sisa=200k
    $upline = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->platinum()->for($upline)->create();
    Wallet::factory()->for($upline)->create();

    $goldSponsor = User::factory()->create(['sponsor_id' => $upline->id]);
    $goldProfile = MemberProfile::factory()->gold()->for($goldSponsor)->create();
    Wallet::factory()->for($goldSponsor)->create();

    $pin = makeBonusPin(PackageType::Platinum, $goldSponsor->id);

    actingAs($goldSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'newplatinum2@member.test'));

    $passUpBonus = \App\Models\Bonus::where('member_profile_id', $uplineProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($passUpBonus)->not->toBeNull()
        ->and($passUpBonus->amount)->toBe(200_000);
});

it('same_package_recruiting_no_pass_up_created', function () {
    // Silver recruits Silver → sisa = 0, no pass-up
    $upline = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->gold()->for($upline)->create();
    Wallet::factory()->for($upline)->create();

    $silverSponsor = User::factory()->create(['sponsor_id' => $upline->id]);
    $silverProfile = MemberProfile::factory()->silver()->for($silverSponsor)->create();
    Wallet::factory()->for($silverSponsor)->create();

    $pin = makeBonusPin(PackageType::Silver, $silverSponsor->id);

    actingAs($silverSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'samepackage@member.test'));

    $passUpBonus = \App\Models\Bonus::where('member_profile_id', $uplineProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($passUpBonus)->toBeNull();
});

it('higher_package_recruiting_lower_no_pass_up_created', function () {
    // Gold sponsor recruits Silver → sisa = 0 (alokasi=200k, bonus=200k)
    $upline = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->platinum()->for($upline)->create();
    Wallet::factory()->for($upline)->create();

    $goldSponsor = User::factory()->create(['sponsor_id' => $upline->id]);
    $goldProfile = MemberProfile::factory()->gold()->for($goldSponsor)->create();
    Wallet::factory()->for($goldSponsor)->create();

    $pin = makeBonusPin(PackageType::Silver, $goldSponsor->id);

    actingAs($goldSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'lower@member.test'));

    $passUpBonus = \App\Models\Bonus::where('member_profile_id', $uplineProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($passUpBonus)->toBeNull();
});

it('pass_up_skips_same_level_uplines', function () {
    // Chain: Platinum upline → Gold upline2 → Gold sponsor → recruits Platinum
    // alokasi=600k, sponsor bonus=400k, sisa=200k → Gold upline2 di-skip (sama level), Platinum dapat 200k
    $platinumUpline = User::factory()->create();
    $platinumProfile = MemberProfile::factory()->platinum()->for($platinumUpline)->create();
    Wallet::factory()->for($platinumUpline)->create();

    $goldUpline2 = User::factory()->create(['sponsor_id' => $platinumUpline->id]);
    $goldProfile2 = MemberProfile::factory()->gold()->for($goldUpline2)->create();
    Wallet::factory()->for($goldUpline2)->create();

    $goldSponsor = User::factory()->create(['sponsor_id' => $goldUpline2->id]);
    $goldProfile = MemberProfile::factory()->gold()->for($goldSponsor)->create();
    Wallet::factory()->for($goldSponsor)->create();

    $pin = makeBonusPin(PackageType::Platinum, $goldSponsor->id);

    actingAs($goldSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'skiptest@member.test'));

    // Gold upline2 (same level as Gold sponsor) should NOT get pass-up
    $skipBonus = \App\Models\Bonus::where('member_profile_id', $goldProfile2->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    // Platinum upline should get pass-up (sisa=200k, max Platinum=400k → 200k)
    $passUpBonus = \App\Models\Bonus::where('member_profile_id', $platinumProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($skipBonus)->toBeNull()
        ->and($passUpBonus)->not->toBeNull()
        ->and($passUpBonus->amount)->toBe(200_000);
});

it('pass_up_distributes_to_multiple_uplines_when_sisa_exceeds_gold_cap', function () {
    // Chain: Platinum(P2) → Gold(G1) → Silver(S1) → recruits Platinum(P1)
    // sisa=400k: G1 dapat min(400k, 200k)=200k, sisa=200k → P2 dapat min(200k, 400k)=200k
    $platinumUpline = User::factory()->create();
    $platinumProfile = MemberProfile::factory()->platinum()->for($platinumUpline)->create();
    Wallet::factory()->for($platinumUpline)->create();

    $goldUpline = User::factory()->create(['sponsor_id' => $platinumUpline->id]);
    $goldProfile = MemberProfile::factory()->gold()->for($goldUpline)->create();
    Wallet::factory()->for($goldUpline)->create();

    $silverSponsor = User::factory()->create(['sponsor_id' => $goldUpline->id]);
    $silverProfile = MemberProfile::factory()->silver()->for($silverSponsor)->create();
    Wallet::factory()->for($silverSponsor)->create();

    $pin = makeBonusPin(PackageType::Platinum, $silverSponsor->id);

    actingAs($silverSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'multidist@member.test'));

    $goldBonus = \App\Models\Bonus::where('member_profile_id', $goldProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    $platinumBonus = \App\Models\Bonus::where('member_profile_id', $platinumProfile->id)
        ->where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)
        ->first();

    expect($goldBonus)->not->toBeNull()
        ->and($goldBonus->amount)->toBe(200_000)
        ->and($platinumBonus)->not->toBeNull()
        ->and($platinumBonus->amount)->toBe(200_000);
});

it('no_eligible_upline_no_pass_up_created', function () {
    // Silver sponsor with no upline higher than Silver
    $sameUpline = User::factory()->create();
    $sameProfile = MemberProfile::factory()->silver()->for($sameUpline)->create();
    Wallet::factory()->for($sameUpline)->create();

    $silverSponsor = User::factory()->create(['sponsor_id' => $sameUpline->id]);
    $silverProfile = MemberProfile::factory()->silver()->for($silverSponsor)->create();
    Wallet::factory()->for($silverSponsor)->create();

    $pin = makeBonusPin(PackageType::Gold, $silverSponsor->id);

    actingAs($silverSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'noupline@member.test'));

    $totalPassUp = \App\Models\Bonus::where('bonus_type', \App\Enums\Mlm\BonusType::PassUpSponsor->value)->count();

    expect($totalPassUp)->toBe(0);
});

it('pass_up_email_is_queued_for_recipient', function () {
    $upline = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->gold()->for($upline)->create();
    Wallet::factory()->for($upline)->create();

    $silverSponsor = User::factory()->create(['sponsor_id' => $upline->id]);
    $silverProfile = MemberProfile::factory()->silver()->for($silverSponsor)->create();
    Wallet::factory()->for($silverSponsor)->create();

    $pin = makeBonusPin(PackageType::Gold, $silverSponsor->id);

    actingAs($silverSponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'emailtest@member.test'));

    Mail::assertQueued(BonusAvailable::class, function (BonusAvailable $mail) use ($upline) {
        return $mail->hasTo($upline->email);
    });
});

// ── Real-Time Pairing Bonus ────────────────────────────────────────────────

it('pairing_bonus_created_realtime_when_pair_forms', function () {
    // Sponsor already has 1 right-leg PP (simulating a previous right-leg registration)
    $this->sponsorProfile->update(['right_pp_total' => 1]);

    // Register new member on left leg → sponsor gets 1 left PP → pair forms immediately
    $pin = makeBonusPin(PackageType::Silver, $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left'));

    $pairingBonus = Bonus::where('member_profile_id', $this->sponsorProfile->id)
        ->where('bonus_type', BonusType::Pairing->value)
        ->first();

    expect($pairingBonus)->not->toBeNull()
        ->and($pairingBonus->amount)->toBe(1 * 100_000)
        ->and($pairingBonus->status->value)->toBe('Pending')
        ->and($pairingBonus->daily_bonus_run_id)->toBeNull();

    // PP consumed after pairing
    $this->sponsorProfile->refresh();
    expect($this->sponsorProfile->left_pp_total)->toBe(0)
        ->and($this->sponsorProfile->right_pp_total)->toBe(0);
});

it('pairing_bonus_not_created_if_only_one_leg_has_pp', function () {
    // Sponsor has no pre-existing PP; left-only registration cannot form a pair
    $pin = makeBonusPin(PackageType::Silver, $this->sponsor->id);

    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin, 'left'));

    expect(
        Bonus::where('member_profile_id', $this->sponsorProfile->id)
            ->where('bonus_type', BonusType::Pairing->value)
            ->count()
    )->toBe(0);
});

// ── Real-Time Matching Bonus ───────────────────────────────────────────────

it('matching_bonus_created_realtime_after_pairing', function () {
    // Rantai rekrut: uplineUser → sponsorUser
    $uplineUser = User::factory()->create();
    $uplineProfile = MemberProfile::factory()->silver()->for($uplineUser)->create();

    $sponsorUser = User::factory()->create(['sponsor_id' => $uplineUser->id]);
    $sponsorProfile = MemberProfile::factory()->silver()->for($sponsorUser)->create([
        'right_pp_total' => 1, // Pre-existing right-leg PP to allow pairing
    ]);
    Wallet::factory()->for($sponsorUser)->create();

    // Silver pairingPoint = 1; left registration completes the pair for sponsorProfile
    $pin = makeBonusPin(PackageType::Silver, $sponsorUser->id);

    actingAs($sponsorUser)
        ->post('/member/register', bonusRegisterPayload($pin, 'left', 'rtmatch@member.test'));

    // sponsorProfile forms 1 pair → 100,000 pairing bonus
    // uplineProfile (G1) → 15% matching = 15,000
    $matchingBonus = Bonus::where('member_profile_id', $uplineProfile->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();

    expect($matchingBonus)->not->toBeNull()
        ->and($matchingBonus->amount)->toBe(15_000)
        ->and($matchingBonus->meta['generation'])->toBe(1)
        ->and($matchingBonus->daily_bonus_run_id)->toBeNull();
});

// ── Real-Time Leveling Bonus ───────────────────────────────────────────────

it('leveling_bonus_created_realtime_when_both_sides_filled', function () {
    // First registration: left leg only → no leveling yet
    $pin1 = makeBonusPin(PackageType::Silver, $this->sponsor->id);
    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin1, 'left', 'lv1left@member.test'));

    expect(
        Bonus::where('member_profile_id', $this->sponsorProfile->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(0);

    // Second registration: right leg → level 1 now complete → leveling bonus immediately!
    $pin2 = makeBonusPin(PackageType::Silver, $this->sponsor->id);
    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin2, 'right', 'lv1right@member.test'));

    $levelingBonus = Bonus::where('member_profile_id', $this->sponsorProfile->id)
        ->where('bonus_type', BonusType::Leveling->value)
        ->first();

    // Silver + Silver = 250,000
    expect($levelingBonus)->not->toBeNull()
        ->and($levelingBonus->amount)->toBe(250_000)
        ->and($levelingBonus->meta['level'])->toBe(1)
        ->and($levelingBonus->daily_bonus_run_id)->toBeNull();

    $this->sponsorProfile->refresh();
    expect($this->sponsorProfile->leveling_rewarded_levels)->toContain(1);
});

it('leveling_bonus_not_given_twice_for_same_level', function () {
    // Two registrations complete level 1 → 1 leveling bonus
    $pin1 = makeBonusPin(PackageType::Silver, $this->sponsor->id);
    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin1, 'left', 'lv2left@member.test'));

    $pin2 = makeBonusPin(PackageType::Silver, $this->sponsor->id);
    actingAs($this->sponsor)
        ->post('/member/register', bonusRegisterPayload($pin2, 'right', 'lv2right@member.test'));

    // Level 1 is marked as rewarded; no duplicate bonus on any further activity
    expect(
        Bonus::where('member_profile_id', $this->sponsorProfile->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(1);
});
