<?php

namespace Database\Factories;

use App\Models\MemberProfile;
use App\Models\RewardMilestone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MemberReward>
 */
class MemberRewardFactory extends Factory
{
    public function definition(): array
    {
        return [
            'member_profile_id' => MemberProfile::factory(),
            'reward_milestone_id' => RewardMilestone::factory(),
            'status' => 'pending',
            'qualified_at' => fake()->dateTimeBetween('-3 months', 'now'),
            'fulfilled_at' => null,
        ];
    }

    public function fulfilled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'fulfilled',
            'fulfilled_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }
}
