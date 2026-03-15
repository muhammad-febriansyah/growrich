<?php

use App\Enums\Mlm\BonusType;
use App\Models\MemberProfile;
use App\Models\RepeatOrder;
use App\Models\User;
use App\Models\Wallet;
use App\Services\BonusRunnerService;

beforeEach(function () {
    $this->member = User::factory()->create();
    $this->profile = MemberProfile::factory()->for($this->member)->create();
    $this->wallet = Wallet::factory()->for($this->member)->create(['balance' => 0]);
    $this->service = app(BonusRunnerService::class);
});

it('creates_auto_ro_when_ewallet_reaches_1_000_000', function () {
    $this->wallet->update(['balance' => 800_000]);

    // Credit 400k — brings total to 1.2m, should trigger auto RO
    $this->service->createApprovedBonus([
        'member_profile_id' => $this->profile->id,
        'bonus_type' => BonusType::Pairing->value,
        'amount' => 500_000,
        'ewallet_amount' => 400_000,
        'cash_amount' => 100_000,
        'bonus_date' => now()->toDateString(),
    ]);

    $this->wallet->refresh();

    expect(RepeatOrder::where('member_profile_id', $this->profile->id)
        ->where('payment_method', 'ewallet')
        ->where('status', 'completed')
        ->count())->toBe(1);

    // Balance: 800k + 400k - 1000k = 200k
    expect($this->wallet->balance)->toBe(200_000);
});

it('does_not_create_auto_ro_when_ewallet_below_1_000_000', function () {
    $this->wallet->update(['balance' => 0]);

    $this->service->createApprovedBonus([
        'member_profile_id' => $this->profile->id,
        'bonus_type' => BonusType::Pairing->value,
        'amount' => 500_000,
        'ewallet_amount' => 200_000,
        'cash_amount' => 300_000,
        'bonus_date' => now()->toDateString(),
    ]);

    expect(RepeatOrder::where('member_profile_id', $this->profile->id)
        ->where('payment_method', 'ewallet')
        ->count())->toBe(0);
});

it('creates_auto_ro_only_once_per_month', function () {
    $this->wallet->update(['balance' => 800_000]);

    // First bonus — triggers auto RO
    $this->service->createApprovedBonus([
        'member_profile_id' => $this->profile->id,
        'bonus_type' => BonusType::Pairing->value,
        'amount' => 500_000,
        'ewallet_amount' => 400_000,
        'cash_amount' => 100_000,
        'bonus_date' => now()->toDateString(),
    ]);

    $this->wallet->refresh();
    $balanceAfterFirst = $this->wallet->balance;

    // Credit more — balance > 1jt again, but should NOT trigger another auto RO
    $this->wallet->update(['balance' => 1_500_000]);

    $this->service->createApprovedBonus([
        'member_profile_id' => $this->profile->id,
        'bonus_type' => BonusType::Matching->value,
        'amount' => 500_000,
        'ewallet_amount' => 200_000,
        'cash_amount' => 300_000,
        'bonus_date' => now()->toDateString(),
    ]);

    expect(RepeatOrder::where('member_profile_id', $this->profile->id)
        ->where('payment_method', 'ewallet')
        ->whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->count())->toBe(1);
});

it('auto_ro_is_marked_as_completed_with_correct_period', function () {
    $this->wallet->update(['balance' => 800_000]);

    $this->service->createApprovedBonus([
        'member_profile_id' => $this->profile->id,
        'bonus_type' => BonusType::Pairing->value,
        'amount' => 500_000,
        'ewallet_amount' => 400_000,
        'cash_amount' => 100_000,
        'bonus_date' => now()->toDateString(),
    ]);

    $ro = RepeatOrder::where('member_profile_id', $this->profile->id)
        ->where('payment_method', 'ewallet')
        ->first();

    expect($ro)->not->toBeNull()
        ->and($ro->status)->toBe('completed')
        ->and($ro->total_amount)->toBe(1_000_000)
        ->and($ro->period_month)->toBe(now()->month)
        ->and($ro->period_year)->toBe(now()->year)
        ->and($ro->paid_at)->not->toBeNull();
});
