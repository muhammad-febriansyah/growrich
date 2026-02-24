<?php

namespace Database\Seeders;

use App\Models\CareerLevel;
use Illuminate\Database\Seeder;

class CareerLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            [
                'key' => 'Member',
                'label' => 'Member',
                'required_pp' => 0,
                'global_share_percent' => 0,
                'sort_order' => 1,
                'dot_color' => 'bg-gray-300',
                'text_color' => 'text-gray-400',
            ],
            [
                'key' => 'CoreLoader',
                'label' => 'Core Loader',
                'required_pp' => 25,
                'global_share_percent' => 1.0,
                'sort_order' => 2,
                'dot_color' => 'bg-blue-400',
                'text_color' => 'text-blue-600',
            ],
            [
                'key' => 'SapphireManager',
                'label' => 'Sapphire Manager',
                'required_pp' => 100,
                'global_share_percent' => 1.0,
                'sort_order' => 3,
                'dot_color' => 'bg-cyan-400',
                'text_color' => 'text-cyan-600',
            ],
            [
                'key' => 'RubyManager',
                'label' => 'Ruby Manager',
                'required_pp' => 500,
                'global_share_percent' => 1.0,
                'sort_order' => 4,
                'dot_color' => 'bg-rose-400',
                'text_color' => 'text-rose-600',
            ],
            [
                'key' => 'EmeraldManager',
                'label' => 'Emerald Manager',
                'required_pp' => 1000,
                'global_share_percent' => 1.5,
                'sort_order' => 5,
                'dot_color' => 'bg-emerald-400',
                'text_color' => 'text-emerald-600',
            ],
            [
                'key' => 'DiamondManager',
                'label' => 'Diamond Manager',
                'required_pp' => 5000,
                'global_share_percent' => 2.0,
                'sort_order' => 6,
                'dot_color' => 'bg-violet-400',
                'text_color' => 'text-violet-600',
            ],
            [
                'key' => 'BlueDiamondManager',
                'label' => 'Blue Diamond Manager',
                'required_pp' => 10000,
                'global_share_percent' => 2.5,
                'sort_order' => 7,
                'dot_color' => 'bg-indigo-400',
                'text_color' => 'text-indigo-600',
            ],
            [
                'key' => 'EliteTeamGlobal',
                'label' => 'Elite Team Global',
                'required_pp' => 25000,
                'global_share_percent' => 3.0,
                'sort_order' => 8,
                'dot_color' => 'bg-amber-400',
                'text_color' => 'text-amber-600',
            ],
        ];

        foreach ($levels as $level) {
            CareerLevel::updateOrCreate(['key' => $level['key']], $level);
        }
    }
}
