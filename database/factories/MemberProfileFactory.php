<?php

namespace Database\Factories;

use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MemberProfile>
 */
class MemberProfileFactory extends Factory
{
    public function definition(): array
    {
        $package = fake()->randomElement(PackageType::cases());

        return [
            'user_id' => User::factory(),
            'package_type' => $package->value,
            'package_status' => 'active',
            'pin_code' => strtoupper(Str::random(4)).fake()->numerify('####'),
            'activated_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'left_child_id' => null,
            'right_child_id' => null,
            'parent_id' => null,
            'leg_position' => null,
            'left_pp_total' => 0,
            'right_pp_total' => 0,
            'left_rp_total' => 0,
            'right_rp_total' => 0,
            'career_level' => CareerLevel::Member->value,
        ];
    }

    public function silver(): static
    {
        return $this->state(fn (array $attributes) => [
            'package_type' => PackageType::Silver->value,
        ]);
    }

    public function gold(): static
    {
        return $this->state(fn (array $attributes) => [
            'package_type' => PackageType::Gold->value,
        ]);
    }

    public function platinum(): static
    {
        return $this->state(fn (array $attributes) => [
            'package_type' => PackageType::Platinum->value,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'package_status' => 'inactive',
            'activated_at' => null,
        ]);
    }

    public function withPoints(int $leftPp, int $rightPp, int $leftRp = 0, int $rightRp = 0): static
    {
        return $this->state(fn (array $attributes) => [
            'left_pp_total' => $leftPp,
            'right_pp_total' => $rightPp,
            'left_rp_total' => $leftRp,
            'right_rp_total' => $rightRp,
        ]);
    }

    public function atLevel(CareerLevel $level): static
    {
        return $this->state(fn (array $attributes) => [
            'career_level' => $level->value,
        ]);
    }
}
