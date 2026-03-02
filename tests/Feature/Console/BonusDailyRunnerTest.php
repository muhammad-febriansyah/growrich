<?php

use App\Enums\Mlm\BonusType;
use App\Models\Bonus;
use App\Models\DailyBonusRun;
use App\Models\MemberProfile;
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
