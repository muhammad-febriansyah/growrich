<?php

namespace Database\Factories;

use App\Enums\Mlm\PackageType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RegistrationPin>
 */
class RegistrationPinFactory extends Factory
{
    public function definition(): array
    {
        $package = fake()->randomElement(PackageType::cases());

        return [
            'pin_code' => strtoupper(Str::random(4)).fake()->numerify('####'),
            'package_type' => $package->value,
            'price' => $package->registrationPrice(),
            'purchased_by' => User::factory(),
            'used_by' => null,
            'status' => 'available',
        ];
    }

    public function forPackage(PackageType $package): static
    {
        return $this->state(fn (array $attributes) => [
            'package_type' => $package->value,
            'price' => $package->registrationPrice(),
        ]);
    }

    public function used(int $usedById): static
    {
        return $this->state(fn (array $attributes) => [
            'used_by' => $usedById,
            'status' => 'used',
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
        ]);
    }
}
