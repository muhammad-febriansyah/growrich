<?php

use App\Models\MemberProfile;
use App\Models\User;
use App\Models\Wallet;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->member = User::factory()->create();
    $this->profile = MemberProfile::factory()->for($this->member)->create();
    $this->wallet = Wallet::factory()->for($this->member)->create(['balance' => 0]);
});

it('cannot_withdraw_when_balance_is_below_1_000_000', function () {
    $this->wallet->update(['balance' => 900_000]);

    actingAs($this->member)
        ->post('/member/withdraw', [
            'amount' => 100_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_name' => 'Test User',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(900_000);
});

it('cannot_withdraw_more_than_balance_minus_1_000_000', function () {
    $this->wallet->update(['balance' => 1_500_000]);

    actingAs($this->member)
        ->post('/member/withdraw', [
            'amount' => 600_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_name' => 'Test User',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(1_500_000);
});

it('can_withdraw_up_to_balance_minus_1_000_000', function () {
    $this->wallet->update(['balance' => 1_500_000]);

    actingAs($this->member)
        ->post('/member/withdraw', [
            'amount' => 500_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_name' => 'Test User',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(1_000_000);
});

it('cannot_withdraw_when_balance_exactly_1_000_000', function () {
    $this->wallet->update(['balance' => 1_000_000]);

    actingAs($this->member)
        ->post('/member/withdraw', [
            'amount' => 50_000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_name' => 'Test User',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->wallet->refresh();
    expect($this->wallet->balance)->toBe(1_000_000);
});
