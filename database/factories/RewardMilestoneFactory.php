<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RewardMilestone>
 */
class RewardMilestoneFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'reward_type' => fake()->randomElement(['cash', 'trip', 'car', 'house', 'motor']),
            'required_left_rp' => fake()->numberBetween(1_000, 100_000),
            'required_right_rp' => fake()->numberBetween(1_000, 100_000),
            'cash_value' => fake()->numberBetween(1_000_000, 500_000_000),
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
