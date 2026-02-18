<?php

namespace Database\Seeders;

use App\Models\RewardMilestone;
use Illuminate\Database\Seeder;

class RewardMilestoneSeeder extends Seeder
{
    public function run(): void
    {
        $milestones = [
            // ── Holy Trip Reward ─────────────────────────────────────────────
            [
                'name' => 'Holy Trip - Umroh',
                'reward_type' => 'trip',
                'required_left_rp' => 250,
                'required_right_rp' => 250,
                'cash_value' => 5_000_000,
                'sort_order' => 1,
            ],

            // ── Cash Reward ──────────────────────────────────────────────────
            [
                'name' => 'Cash Reward #2',
                'reward_type' => 'cash',
                'required_left_rp' => 650,
                'required_right_rp' => 650,
                'cash_value' => 100_000_000,
                'sort_order' => 2,
            ],

            // ── Car Reward ───────────────────────────────────────────────────
            [
                'name' => 'Car Reward - Honda Mobilio',
                'reward_type' => 'car',
                'required_left_rp' => 1_550,
                'required_right_rp' => 1_550,
                'cash_value' => 220_000_000,
                'sort_order' => 3,
            ],
            [
                'name' => 'Cash Reward #3',
                'reward_type' => 'cash',
                'required_left_rp' => 3_550,
                'required_right_rp' => 3_550,
                'cash_value' => 500_000_000,
                'sort_order' => 4,
            ],
            [
                'name' => 'Car Reward - Toyota Fortuner',
                'reward_type' => 'car',
                'required_left_rp' => 6_000,
                'required_right_rp' => 6_000,
                'cash_value' => 450_000_000,
                'sort_order' => 5,
            ],
            [
                'name' => 'Car Reward - Mercedes Benz C-Class',
                'reward_type' => 'car',
                'required_left_rp' => 9_000,
                'required_right_rp' => 9_000,
                'cash_value' => 700_000_000,
                'sort_order' => 6,
            ],
            [
                'name' => 'Cash Reward #4',
                'reward_type' => 'cash',
                'required_left_rp' => 13_000,
                'required_right_rp' => 13_000,
                'cash_value' => 1_000_000_000,
                'sort_order' => 7,
            ],
            [
                'name' => 'Car Reward - Toyota Alphard',
                'reward_type' => 'car',
                'required_left_rp' => 19_000,
                'required_right_rp' => 19_000,
                'cash_value' => 900_000_000,
                'sort_order' => 8,
            ],

            // ── Property Reward ──────────────────────────────────────────────
            [
                'name' => 'Property Reward - Rumah Mewah Pertama',
                'reward_type' => 'property',
                'required_left_rp' => 29_000,
                'required_right_rp' => 29_000,
                'cash_value' => 2_000_000_000,
                'sort_order' => 9,
            ],
            [
                'name' => 'Property Reward - Rumah Mewah Kedua',
                'reward_type' => 'property',
                'required_left_rp' => 49_000,
                'required_right_rp' => 49_000,
                'cash_value' => 3_000_000_000,
                'sort_order' => 10,
            ],
        ];

        foreach ($milestones as $milestone) {
            RewardMilestone::create($milestone);
        }
    }
}
