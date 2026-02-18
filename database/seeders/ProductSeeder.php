<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'MOIREA IONA',
                'sku' => 'IONA-001',
                'regular_price' => 612_500,
                'ro_price' => 485_000,
            ],
            [
                'name' => 'MOIREA MACRA',
                'sku' => 'MACRA-001',
                'regular_price' => 612_500,
                'ro_price' => 465_000,
            ],
            [
                'name' => 'MOIREA ALCEO',
                'sku' => 'ALCEO-001',
                'regular_price' => 612_500,
                'ro_price' => 375_000,
            ],
            [
                'name' => 'MOIREA NICETO',
                'sku' => 'NICETO-001',
                'regular_price' => 612_500,
                'ro_price' => 415_000,
            ],
            [
                'name' => 'BEAUTY ACTIVATOR',
                'sku' => 'BA-001',
                'regular_price' => 4_900_000,
                'ro_price' => 3_500_000,
            ],
        ];

        foreach ($products as $product) {
            Product::create(array_merge($product, ['is_active' => true]));
        }
    }
}
