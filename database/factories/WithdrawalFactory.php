<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Withdrawal>
 */
class WithdrawalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => fake()->numberBetween(100_000, 5_000_000),
            'bank_name' => fake()->randomElement(['BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga', 'BSI']),
            'account_number' => fake()->numerify('##############'),
            'account_name' => fake()->name(),
            'status' => 'pending',
            'processed_by' => null,
        ];
    }

    public function approved(int $processedBy): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'processed_by' => $processedBy,
        ]);
    }

    public function rejected(int $processedBy): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'processed_by' => $processedBy,
        ]);
    }
}
