<?php

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\CareerLevel;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\RewardMilestone;
use App\Models\User;
use App\Models\Wallet;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->profile = MemberProfile::factory()
        ->for($this->user)
        ->withPoints(leftPp: 500, rightPp: 400, leftRp: 200, rightRp: 180)
        ->atLevel(CareerLevel::RubyManager)
        ->create();
    Wallet::factory()->for($this->user)->create(['balance' => 1_500_000]);
});

it('renders the dashboard with real stats for a member', function () {
    $response = actingAs($this->user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats')
        ->where('stats.walletBalance', 1_500_000)
        ->where('stats.leftPp', 500)
        ->where('stats.rightPp', 400)
        ->where('stats.careerLevel', CareerLevel::RubyManager->label())
        ->where('stats.nextLevelLabel', CareerLevel::EmeraldManager->label())
        ->where('stats.nextLevelPp', CareerLevel::EmeraldManager->requiredPp())
        ->has('recentBonuses')
        ->has('rewardProgress')
    );
});

it('counts direct downlines in total downline stat', function () {
    MemberProfile::factory()->create(['parent_id' => $this->profile->id]);
    MemberProfile::factory()->create(['parent_id' => $this->profile->id]);

    $response = actingAs($this->user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('stats.totalDownline', 2)
    );
});

it('counts bonus this month correctly', function () {
    Bonus::factory()->create([
        'member_profile_id' => $this->profile->id,
        'amount'            => 500_000,
        'status'            => BonusStatus::Paid,
        'bonus_date'        => now()->startOfMonth(),
    ]);
    Bonus::factory()->create([
        'member_profile_id' => $this->profile->id,
        'amount'            => 300_000,
        'status'            => BonusStatus::Approved,
        'bonus_date'        => now(),
    ]);
    // Rejected bonus — should not be counted
    Bonus::factory()->create([
        'member_profile_id' => $this->profile->id,
        'amount'            => 999_999,
        'status'            => BonusStatus::Rejected,
        'bonus_date'        => now(),
    ]);

    $response = actingAs($this->user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('stats.totalBonusThisMonth', 800_000)
    );
});

it('returns the next reward milestone', function () {
    RewardMilestone::factory()->create([
        'name'              => 'Test Reward',
        'required_left_rp'  => 500,
        'required_right_rp' => 500,
        'sort_order'        => 1,
    ]);

    $response = actingAs($this->user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('rewardProgress.name', 'Test Reward')
        ->where('rewardProgress.currentLeftRp', 200)
        ->where('rewardProgress.currentRightRp', 180)
    );
});

it('returns null reward progress when all milestones are achieved', function () {
    RewardMilestone::factory()->create([
        'required_left_rp'  => 10,
        'required_right_rp' => 10,
        'sort_order'        => 1,
    ]);

    // Profile already has 200/180 RP — exceeds the milestone
    $response = actingAs($this->user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->where('rewardProgress', null)
    );
});

it('returns up to 5 recent bonuses', function () {
    Bonus::factory()->count(8)->create([
        'member_profile_id' => $this->profile->id,
        'bonus_date'        => now(),
    ]);

    $response = actingAs($this->user)->get('/dashboard');

    $response->assertInertia(fn ($page) => $page
        ->has('recentBonuses', 5)
    );
});

it('redirects unauthenticated users', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});
