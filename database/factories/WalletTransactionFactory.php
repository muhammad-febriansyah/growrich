<?php

namespace Database\Factories;

use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WalletTransaction>
 */
class WalletTransactionFactory extends Factory
{
    public function definition(): array
    {
        $amount = fake()->numberBetween(10_000, 2_000_000);
        $balanceBefore = fake()->numberBetween(0, 10_000_000);

        return [
            'wallet_id' => Wallet::factory(),
            'type' => fake()->randomElement(['credit', 'debit']),
            'amount' => $amount,
            'reference_type' => null,
            'reference_id' => null,
            'description' => fake()->sentence(),
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceBefore + $amount,
        ];
    }

    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'credit',
            'balance_after' => $attributes['balance_before'] + $attributes['amount'],
        ]);
    }

    public function debit(): static
    {
        return $this->state(function (array $attributes) {
            $before = max($attributes['amount'], $attributes['balance_before']);

            return [
                'type' => 'debit',
                'balance_before' => $before,
                'balance_after' => $before - $attributes['amount'],
            ];
        });
    }
}
