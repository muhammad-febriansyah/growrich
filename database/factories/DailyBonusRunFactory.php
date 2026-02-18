<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DailyBonusRun>
 */
class DailyBonusRunFactory extends Factory
{
    public function definition(): array
    {
        $startedAt = fake()->dateTimeBetween('-30 days', '-1 hour');

        return [
            'run_date' => fake()->unique()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'status' => 'completed',
            'started_at' => $startedAt,
            'completed_at' => (clone $startedAt)->modify('+'.fake()->numberBetween(1, 10).' minutes'),
            'total_pairing_bonus' => fake()->numberBetween(0, 50_000_000),
            'total_matching_bonus' => fake()->numberBetween(0, 20_000_000),
            'total_leveling_bonus' => fake()->numberBetween(0, 10_000_000),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'started_at' => null,
            'completed_at' => null,
        ]);
    }

    public function running(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'running',
            'started_at' => now(),
            'completed_at' => null,
        ]);
    }
}
