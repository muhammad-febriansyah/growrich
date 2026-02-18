<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $regularPrice = fake()->numberBetween(50_000, 500_000);

        return [
            'name' => fake()->words(3, true),
            'sku' => strtoupper(Str::random(3)).'-'.fake()->numerify('###'),
            'regular_price' => $regularPrice,
            'ro_price' => (int) ($regularPrice * 0.9),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
