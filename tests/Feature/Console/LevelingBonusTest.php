<?php

use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\PackageType;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Services\BonusRunnerService;
use Carbon\Carbon;
use Database\Seeders\PackageSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Support\Facades\Mail;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Create a parent with a direct left child and right child (Level 1 pair).
 */
function makeMemberWithChildren(PackageType $leftPkg, PackageType $rightPkg): MemberProfile
{
    $leftChild = MemberProfile::factory()->create([
        'package_type' => $leftPkg->value,
        'package_status' => 'active',
    ]);

    $rightChild = MemberProfile::factory()->create([
        'package_type' => $rightPkg->value,
        'package_status' => 'active',
    ]);

    return MemberProfile::factory()->create([
        'package_status' => 'active',
        'left_child_id' => $leftChild->id,
        'right_child_id' => $rightChild->id,
    ]);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(function () {
    Mail::fake();
    $this->seed([PackageSeeder::class, SiteSettingSeeder::class]);
});

/**
 * Brosur rules:
 *  Silver+Silver = 250,000 | Silver+Gold = 250,000 | Silver+Platinum = 250,000
 *  Gold+Gold     = 500,000 | Gold+Platinum = 500,000
 *  Platinum+Platinum = 750,000
 */
it('leveling_bonus_amount_matches_brosur_rules', function (PackageType $left, PackageType $right, int $expectedAmount) {
    $date = Carbon::parse('2026-02-01');
    $parent = makeMemberWithChildren($left, $right);

    app(BonusRunnerService::class)->runDaily($date);

    $bonus = Bonus::where('member_profile_id', $parent->id)
        ->where('bonus_type', BonusType::Leveling->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->amount)->toBe($expectedAmount);
})->with([
    'Silver+Silver = 250k' => [PackageType::Silver,   PackageType::Silver,   250_000],
    'Silver+Gold = 250k' => [PackageType::Silver,   PackageType::Gold,     250_000],
    'Silver+Platinum = 250k' => [PackageType::Silver,   PackageType::Platinum, 250_000],
    'Gold+Gold = 500k' => [PackageType::Gold,     PackageType::Gold,     500_000],
    'Gold+Platinum = 500k' => [PackageType::Gold,     PackageType::Platinum, 500_000],
    'Platinum+Platinum = 750k' => [PackageType::Platinum, PackageType::Platinum, 750_000],
]);

it('leveling_bonus_ewallet_is_20_percent_of_amount', function () {
    $date = Carbon::parse('2026-02-02');
    $parent = makeMemberWithChildren(PackageType::Gold, PackageType::Gold);

    app(BonusRunnerService::class)->runDaily($date);

    $bonus = Bonus::where('member_profile_id', $parent->id)
        ->where('bonus_type', BonusType::Leveling->value)
        ->first();

    expect($bonus)->not->toBeNull()
        ->and($bonus->ewallet_amount)->toBe(100_000)
        ->and($bonus->cash_amount)->toBe(400_000);
});

it('leveling_bonus_not_given_if_member_has_no_children', function () {
    $date = Carbon::parse('2026-02-03');
    $profile = MemberProfile::factory()->create([
        'package_status' => 'active',
        'left_child_id' => null,
        'right_child_id' => null,
    ]);

    app(BonusRunnerService::class)->runDaily($date);

    expect(
        Bonus::where('member_profile_id', $profile->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(0);
});

it('leveling_bonus_not_given_to_inactive_member', function () {
    $date = Carbon::parse('2026-02-04');
    $leftChild = MemberProfile::factory()->create(['package_type' => PackageType::Gold->value, 'package_status' => 'active']);
    $rightChild = MemberProfile::factory()->create(['package_type' => PackageType::Gold->value, 'package_status' => 'active']);

    $parent = MemberProfile::factory()->inactive()->create([
        'left_child_id' => $leftChild->id,
        'right_child_id' => $rightChild->id,
    ]);

    app(BonusRunnerService::class)->runDaily($date);

    expect(
        Bonus::where('member_profile_id', $parent->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(0);
});

it('leveling_bonus_given_only_once_per_level', function () {
    $parent = makeMemberWithChildren(PackageType::Gold, PackageType::Gold);

    // First run: Level 1 bonus awarded
    app(BonusRunnerService::class)->runDaily(Carbon::parse('2026-02-05'));

    expect(
        Bonus::where('member_profile_id', $parent->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(1);

    // Second run: Level 1 already rewarded, no new bonus
    app(BonusRunnerService::class)->runDaily(Carbon::parse('2026-02-06'));

    expect(
        Bonus::where('member_profile_id', $parent->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->count()
    )->toBe(1);

    $parent->refresh();
    expect($parent->leveling_rewarded_levels)->toContain(1);
});

it('leveling_bonus_awarded_for_level_2_when_grandchildren_exist', function () {
    // Build tree: root → leftChild → leftGrandchild (and) root → rightChild → rightGrandchild
    $leftGrandchild = MemberProfile::factory()->gold()->create(['package_status' => 'active']);
    $rightGrandchild = MemberProfile::factory()->gold()->create(['package_status' => 'active']);

    $leftChild = MemberProfile::factory()->silver()->create([
        'package_status' => 'active',
        'left_child_id' => $leftGrandchild->id,
    ]);
    $rightChild = MemberProfile::factory()->silver()->create([
        'package_status' => 'active',
        'left_child_id' => $rightGrandchild->id,
    ]);

    $root = MemberProfile::factory()->platinum()->create([
        'package_status' => 'active',
        'left_child_id' => $leftChild->id,
        'right_child_id' => $rightChild->id,
    ]);

    app(BonusRunnerService::class)->runDaily(Carbon::parse('2026-02-07'));

    $levelingBonuses = Bonus::where('member_profile_id', $root->id)
        ->where('bonus_type', BonusType::Leveling->value)
        ->get();

    // Level 1: Silver+Silver = 250k, Level 2: Gold+Gold = 500k
    expect($levelingBonuses)->toHaveCount(2);

    $level1 = $levelingBonuses->firstWhere(fn ($b) => ($b->meta['level'] ?? null) === 1);
    $level2 = $levelingBonuses->firstWhere(fn ($b) => ($b->meta['level'] ?? null) === 2);

    expect($level1)->not->toBeNull()->and($level1->amount)->toBe(250_000);
    expect($level2)->not->toBeNull()->and($level2->amount)->toBe(500_000);

    $root->refresh();
    expect($root->leveling_rewarded_levels)->toContain(1)->toContain(2);
});
