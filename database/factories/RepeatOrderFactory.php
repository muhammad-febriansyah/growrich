<?php

namespace Database\Factories;

use App\Models\MemberProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RepeatOrder>
 */
class RepeatOrderFactory extends Factory
{
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'member_profile_id' => MemberProfile::factory(),
            'order_number' => 'RO-'.date('Y', $date->getTimestamp()).'-'.fake()->unique()->numerify('######'),
            'total_amount' => fake()->numberBetween(500_000, 5_000_000),
            'status' => fake()->randomElement(['pending', 'confirmed', 'completed']),
            'period_month' => (int) date('n', $date->getTimestamp()),
            'period_year' => (int) date('Y', $date->getTimestamp()),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    public function forPeriod(int $month, int $year): static
    {
        return $this->state(fn (array $attributes) => [
            'period_month' => $month,
            'period_year' => $year,
        ]);
    }
}
