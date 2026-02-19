<?php

use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\PackageType;
use App\Models\Bonus;
use App\Models\DailyBonusRun;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use Illuminate\Support\Facades\Mail;

use function Pest\Laravel\artisan;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMemberWithLedger(string $date, int $leftPoints, int $rightPoints, PackageType $package = PackageType::Silver): MemberProfile
{
    $profile = MemberProfile::factory()->create([
        'package_type' => $package->value,
        'package_status' => 'active',
    ]);

    if ($leftPoints > 0) {
        PairingPointLedger::factory()->create([
            'member_profile_id' => $profile->id,
            'leg' => 'left',
            'points' => $leftPoints,
            'balance_before' => 0,
            'balance_after' => $leftPoints,
            'ledger_date' => $date,
        ]);
    }

    if ($rightPoints > 0) {
        PairingPointLedger::factory()->create([
            'member_profile_id' => $profile->id,
            'leg' => 'right',
            'points' => $rightPoints,
            'balance_before' => 0,
            'balance_after' => $rightPoints,
            'ledger_date' => $date,
        ]);
    }

    return $profile;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    Mail::fake();
});

it('daily_runner_creates_pairing_bonus', function () {
    $date = '2026-01-15';
    // 3 left, 3 right → 3 pairs → 3 * 100_000 = 300_000
    $profile = makeMemberWithLedger($date, 3, 3, PackageType::Silver);

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
    // Silver max = 10 pairs. Feed 15 left & 15 right → should cap at 10
    $profile = makeMemberWithLedger($date, 15, 15, PackageType::Silver);

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
    $profile = makeMemberWithLedger($date, 5, 3, PackageType::Gold);

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
    makeMemberWithLedger($date, 2, 2, PackageType::Silver);
    makeMemberWithLedger($date, 3, 3, PackageType::Silver);

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    $run = DailyBonusRun::whereDate('run_date', $date)->first();

    expect($run)->not->toBeNull()
        ->and($run->total_pairing_bonus)->toBe(5 * 100_000);
});

it('daily_runner_skips_members_with_zero_pp', function () {
    $date = '2026-01-21';
    // Only left PP, no right → min = 0 → no bonus
    $profile = makeMemberWithLedger($date, 5, 0, PackageType::Silver);

    artisan('bonus:run-daily', ['date' => $date])->assertSuccessful();

    expect(Bonus::where('member_profile_id', $profile->id)->count())->toBe(0);
});
