<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'key' => 'Silver',
                'name' => 'Silver',
                'sort_order' => 1,
                'pairing_point' => 1,
                'reward_point' => 0,
                'max_pairing_per_day' => 10,
                'registration_price' => 2_450_000,
                'upgrade_price' => 2_450_000,
                'sponsor_bonus_unit' => 200_000,
                'leveling_bonus_amount' => 250_000,
            ],
            [
                'key' => 'Gold',
                'name' => 'Gold',
                'sort_order' => 2,
                'pairing_point' => 2,
                'reward_point' => 1,
                'max_pairing_per_day' => 20,
                'registration_price' => 4_900_000,
                'upgrade_price' => 2_450_000,
                'sponsor_bonus_unit' => 200_000,
                'leveling_bonus_amount' => 500_000,
            ],
            [
                'key' => 'Platinum',
                'name' => 'Platinum',
                'sort_order' => 3,
                'pairing_point' => 3,
                'reward_point' => 2,
                'max_pairing_per_day' => 30,
                'registration_price' => 7_350_000,
                'upgrade_price' => null,
                'sponsor_bonus_unit' => 200_000,
                'leveling_bonus_amount' => 750_000,
            ],
        ];

        foreach ($packages as $data) {
            Package::updateOrCreate(['key' => $data['key']], $data);
        }
    }
}
