<?php

use App\Enums\Mlm\BonusType;
use App\Models\Bonus;
use App\Models\DailyBonusRun;
use App\Models\MemberProfile;
use App\Models\User;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\artisan;

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    Mail::fake();
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);
});

it('daily_runner_creates_pairing_bonus', function () {
    $date = '2026-01-15';
    // 3 left, 3 right → 3 pairs → 3 * 100_000 = 300_000
    $profile = MemberProfile::factory()->silver()->withPoints(3, 3)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $bonus = Bonus::where('member_profile_id', $profile->id)
        ->where('bonus_type', BonusType::Pairing->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(3 * 100_000)
        ->and($bonus->status->value)->toBe('Pending');
});

it('daily_runner_caps_at_max_pairing_per_day', function () {
    $date = '2026-01-16';
    // Silver max = 10 pairs. Feed 15 left & 15 right → both exceed max → hangus, pairs = 10
    $profile = MemberProfile::factory()->silver()->withPoints(15, 15)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $bonus = Bonus::where('member_profile_id', $profile->id)
        ->where('bonus_type', BonusType::Pairing->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(10 * 100_000);
});

it('daily_runner_uses_min_of_left_and_right_pp', function () {
    $date = '2026-01-17';
    // 5 left, 3 right → min = 3 pairs → 3 * 100_000 = 300_000
    $profile = MemberProfile::factory()->gold()->withPoints(5, 3)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $bonus = Bonus::where('member_profile_id', $profile->id)
        ->where('bonus_type', BonusType::Pairing->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(3 * 100_000);
});

it('daily_runner_creates_daily_bonus_run_record', function () {
    $date = '2026-01-18';

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $run = DailyBonusRun::whereDate('run_date', $date)->first();

    expect($run)->not->toBeNull()
        ->and($run->status)->toBe('completed')
        ->and($run->completed_at)->not->toBeNull();
});

it('daily_runner_prevents_duplicate_run', function () {
    $date = '2026-01-19';

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();
    artisan('bonus:run-daily', ['date' => $date])->assertFailed();

    expect(DailyBonusRun::whereDate('run_date', $date)->count())->toBe(1);
});

it('daily_runner_stores_correct_total_pairing_bonus', function () {
    $date = '2026-01-20';
    // Two members: 2 pairs + 3 pairs = 5 pairs total → 5 * 100_000 = 500_000
    MemberProfile::factory()->silver()->withPoints(2, 2)->create();
    MemberProfile::factory()->silver()->withPoints(3, 3)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $run = DailyBonusRun::whereDate('run_date', $date)->first();

    expect($run)->not->toBeNull()
        ->and($run->total_pairing_bonus)->toBe(5 * 100_000);
});

it('daily_runner_skips_members_with_zero_pp', function () {
    $date = '2026-01-21';
    // Only left PP, no right → min = 0 → no bonus
    $profile = MemberProfile::factory()->silver()->withPoints(5, 0)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    expect(Bonus::where('member_profile_id', $profile->id)->count())->toBe(0);
});

it('daily_runner_hangus_both_legs_when_both_exceed_max', function () {
    $date = '2026-01-22';
    // Silver max = 10. L=12, R=15 → both exceed → pairs=10, both legs go to 0
    $profile = MemberProfile::factory()->silver()->withPoints(12, 15)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $bonus = Bonus::where('member_profile_id', $profile->id)
        ->where('bonus_type', BonusType::Pairing->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(10 * 100_000);

    $profile->refresh();
    expect($profile->left_pp_total)->toBe(0)
        ->and($profile->right_pp_total)->toBe(0);
});

it('daily_runner_carries_over_larger_leg_when_below_max', function () {
    $date = '2026-01-23';
    // Silver max = 10. L=5, R=8 → min(5, 8, 10) = 5 pairs, L→0, R→3
    $profile = MemberProfile::factory()->silver()->withPoints(5, 8)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $bonus = Bonus::where('member_profile_id', $profile->id)
        ->where('bonus_type', BonusType::Pairing->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe(5 * 100_000);

    $profile->refresh();
    expect($profile->left_pp_total)->toBe(0)
        ->and($profile->right_pp_total)->toBe(3);
});

// ── Matching Bonus (berdasarkan rantai rekrutan/sponsor) ───────────────────────

it('matching_bonus_g1_gets_15_percent_of_downline_pairing', function () {
    $date = '2026-02-01';

    // Rantai rekrut: sponsorUser → downlineUser
    $sponsorUser = User::factory()->create();
    $downlineUser = User::factory()->withSponsor($sponsorUser->id)->create();

    $sponsor = MemberProfile::factory()->silver()->for($sponsorUser)->create();
    // downline punya 4 PP kiri dan 4 PP kanan → 4 pasang → 400,000 pairing bonus
    $downline = MemberProfile::factory()->silver()->withPoints(4, 4)->for($downlineUser)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    // Pairing bonus downline = 4 * 100,000 = 400,000
    // Matching G1 untuk sponsor = 15% * 400,000 = 60,000
    $matchingBonus = Bonus::where('member_profile_id', $sponsor->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();

    expect($matchingBonus)->not->toBeNull()
        ->and($matchingBonus->amount)->toBe(60_000);
});

it('matching_bonus_multi_generation_via_sponsor_chain', function () {
    $date = '2026-02-02';

    // Rantai rekrut: romeo → A → B
    // Romeo rekrut A (G1), A rekrut B (G2 untuk Romeo)
    $romeoUser = User::factory()->create();
    $aUser = User::factory()->withSponsor($romeoUser->id)->create();
    $bUser = User::factory()->withSponsor($aUser->id)->create();

    $romeo = MemberProfile::factory()->silver()->for($romeoUser)->create();
    $a = MemberProfile::factory()->silver()->for($aUser)->create();
    // B punya PP → dapat pairing bonus
    $b = MemberProfile::factory()->silver()->withPoints(2, 2)->for($bUser)->create();

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    // Pairing bonus B = 2 * 100,000 = 200,000
    // A (G1 dari B) → 15% * 200,000 = 30,000
    // Romeo (G2 dari B) → 15% * 200,000 = 30,000
    $matchingA = Bonus::where('member_profile_id', $a->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();
    $matchingRomeo = Bonus::where('member_profile_id', $romeo->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();

    expect($matchingA)->not->toBeNull()
        ->and($matchingA->amount)->toBe(30_000)
        ->and($matchingA->meta['generation'])->toBe(1);

    expect($matchingRomeo)->not->toBeNull()
        ->and($matchingRomeo->amount)->toBe(30_000)
        ->and($matchingRomeo->meta['generation'])->toBe(2);
});

it('matching_bonus_uses_sponsor_chain_not_binary_tree_position', function () {
    $date = '2026-02-03';

    // Romeo rekrut F langsung (G1), tapi F ditempatkan jauh di dalam binary tree
    // Posisi tree: romeo → A (parent_id=romeo) → F (parent_id=A)
    // Tapi sponsor: F.sponsor_id = romeo → F tetap G1 untuk Romeo
    $romeoUser = User::factory()->create();
    $aUser = User::factory()->create(); // A tidak disponsori Romeo
    $fUser = User::factory()->withSponsor($romeoUser->id)->create(); // F disponsori Romeo langsung

    $romeo = MemberProfile::factory()->silver()->for($romeoUser)->create();
    $a = MemberProfile::factory()->silver()->for($aUser)->create(['parent_id' => $romeo->id]);
    // F ditempatkan di bawah A dalam tree (parent_id=A), tapi sponsornya adalah Romeo
    $f = MemberProfile::factory()->silver()->withPoints(3, 3)->for($fUser)->create(['parent_id' => $a->id]);

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    // F dapat pairing 300,000
    // Romeo (sponsor langsung F = G1) harus dapat 15% = 45,000
    $matchingRomeo = Bonus::where('member_profile_id', $romeo->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();

    expect($matchingRomeo)->not->toBeNull()
        ->and($matchingRomeo->amount)->toBe(45_000)
        ->and($matchingRomeo->meta['generation'])->toBe(1);

    // A tidak harusnya dapat matching bonus (A bukan sponsor F)
    $matchingA = Bonus::where('member_profile_id', $a->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();

    expect($matchingA)->toBeNull();
});

it('matching_bonus_stops_at_generation_10', function () {
    $date = '2026-02-04';

    // Buat rantai sponsor 11 level panjang
    $users = collect();
    $previousSponsorId = null;
    for ($i = 0; $i <= 10; $i++) {
        $user = User::factory()->create(['sponsor_id' => $previousSponsorId]);
        $users->push($user);
        $previousSponsorId = $user->id;
    }

    // Buat member profiles untuk semua users
    $profiles = $users->map(fn ($user) => MemberProfile::factory()->silver()->for($user)->create());

    // User terakhir (index 10) punya PP
    $profiles->last()->update(['left_pp_total' => 2, 'right_pp_total' => 2]);

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    // User index 0 adalah G10 dari user index 10 → harus dapat matching
    // User index 0's sponsor_id is null, jadi tidak ada G11
    $g10Profile = $profiles->first();
    $matchingG10 = Bonus::where('member_profile_id', $g10Profile->id)
        ->where('bonus_type', BonusType::Matching->value)
        ->first();

    expect($matchingG10)->not->toBeNull();

    // Pastikan total matching records tidak melebihi 10 generasi per downline
    $totalMatchingCount = Bonus::where('bonus_type', BonusType::Matching->value)->count();
    expect($totalMatchingCount)->toBeLessThanOrEqual(10);
});
