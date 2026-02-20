<?php

use App\Enums\Mlm\BonusStatus;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\User;
use App\Models\Wallet;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();

    $this->member = User::factory()->create();
    $this->memberProfile = MemberProfile::factory()->for($this->member)->create();
    $this->wallet = Wallet::factory()->for($this->member)->create(['balance' => 0]);
});

// ── Approve ───────────────────────────────────────────────────────────────────

it('approving_a_bonus_credits_the_member_wallet', function () {
    $bonus = Bonus::factory()
        ->for($this->memberProfile, 'memberProfile')
        ->create(['amount' => 500_000, 'ewallet_amount' => 100_000, 'cash_amount' => 400_000]);

    actingAs($this->admin)
        ->post("/admin/bonuses/{$bonus->id}/approve")
        ->assertRedirect();

    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(100_000);
});

it('approving_a_bonus_creates_a_wallet_transaction', function () {
    $bonus = Bonus::factory()
        ->for($this->memberProfile, 'memberProfile')
        ->create(['amount' => 500_000, 'ewallet_amount' => 100_000, 'cash_amount' => 400_000]);

    actingAs($this->admin)
        ->post("/admin/bonuses/{$bonus->id}/approve");

    expect($this->wallet->transactions()->count())->toBe(1);

    $tx = $this->wallet->transactions()->first();
    expect($tx->type)->toBe('credit')
        ->and($tx->amount)->toBe(100_000)
        ->and($tx->reference_type)->toBe(Bonus::class)
        ->and($tx->reference_id)->toBe($bonus->id);
});

it('approving_a_bonus_sets_status_to_approved', function () {
    $bonus = Bonus::factory()
        ->for($this->memberProfile, 'memberProfile')
        ->create();

    actingAs($this->admin)
        ->post("/admin/bonuses/{$bonus->id}/approve");

    expect($bonus->fresh()->status)->toBe(BonusStatus::Approved);
});

it('cannot_approve_an_already_approved_bonus', function () {
    $bonus = Bonus::factory()
        ->for($this->memberProfile, 'memberProfile')
        ->approved($this->admin->id)
        ->create(['ewallet_amount' => 100_000]);

    actingAs($this->admin)
        ->post("/admin/bonuses/{$bonus->id}/approve");

    // Wallet should still be 0 — no double credit
    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(0);
});

// ── Reject ────────────────────────────────────────────────────────────────────

it('rejecting_a_bonus_does_not_credit_the_wallet', function () {
    $bonus = Bonus::factory()
        ->for($this->memberProfile, 'memberProfile')
        ->create(['ewallet_amount' => 100_000]);

    actingAs($this->admin)
        ->post("/admin/bonuses/{$bonus->id}/reject");

    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(0);
});

it('rejecting_a_bonus_sets_status_to_rejected', function () {
    $bonus = Bonus::factory()
        ->for($this->memberProfile, 'memberProfile')
        ->create();

    actingAs($this->admin)
        ->post("/admin/bonuses/{$bonus->id}/reject");

    expect($bonus->fresh()->status)->toBe(BonusStatus::Rejected);
});
