<?php

use App\Enums\Mlm\CareerLevel;
use App\Models\MemberProfile;
use App\Models\User;
use App\Models\Wallet;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->profile = MemberProfile::factory()
        ->for($this->user)
        ->withPoints(leftPp: 50, rightPp: 40)
        ->atLevel(CareerLevel::Member)
        ->create(['package_status' => 'active']);
    Wallet::factory()->for($this->user)->create(['balance' => 0]);
});

it('renders the simulation page for an active member', function () {
    actingAs($this->user)
        ->get('/member/bonuses/simulation')
        ->assertInertia(fn ($page) => $page
            ->component('member/financial/bonus-simulation')
            ->has('simulation')
            ->whereNot('simulation', null)
            ->has('simulation.pairing')
            ->has('simulation.matching')
            ->has('simulation.leveling')
            ->has('simulation.monthly')
            ->has('simulation.career')
        );
});

it('shows a message instead of simulation for inactive member', function () {
    $this->profile->update(['package_status' => 'inactive']);

    actingAs($this->user)
        ->get('/member/bonuses/simulation')
        ->assertInertia(fn ($page) => $page
            ->component('member/financial/bonus-simulation')
            ->where('simulation', null)
            ->whereNot('message', null)
        );
});

it('shows a message when member has no profile', function () {
    $userNoProfile = User::factory()->create();

    actingAs($userNoProfile)
        ->get('/member/bonuses/simulation')
        ->assertInertia(fn ($page) => $page
            ->component('member/financial/bonus-simulation')
            ->where('simulation', null)
            ->whereNot('message', null)
        );
});

it('returns career progress with correct current level', function () {
    $this->profile->update([
        'left_pp_cumulative' => 30,
        'right_pp_cumulative' => 30,
    ]);

    actingAs($this->user)
        ->get('/member/bonuses/simulation')
        ->assertInertia(fn ($page) => $page
            ->where('simulation.career.current_level', CareerLevel::Member->label())
            ->where('simulation.career.next_level', CareerLevel::CoreLoader->label())
        );
});

it('pairing simulation returns zero pairs when one leg is empty', function () {
    $this->profile->update(['left_pp_total' => 0, 'right_pp_total' => 50]);

    actingAs($this->user)
        ->get('/member/bonuses/simulation')
        ->assertInertia(fn ($page) => $page
            ->where('simulation.pairing.pairs', 0)
            ->where('simulation.pairing.amount', 0)
        );
});

it('requires authentication', function () {
    $this->get('/member/bonuses/simulation')
        ->assertRedirect('/login');
});
