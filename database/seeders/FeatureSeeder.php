<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            [
                'icon' => 'Target',
                'title' => 'Bonus Sponsor Terbesar',
                'description' => 'Dapatkan bonus sponsor hingga Rp 600.000 untuk setiap member yang Anda ajak bergabung.',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'icon' => 'Zap',
                'title' => 'Bonus Pairing Cepat',
                'description' => 'Sistem pairing otomatis yang cair setiap hari dengan potensi hingga puluhan juta rupiah.',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'icon' => 'Trophy',
                'title' => 'Reward Mewah',
                'description' => 'Raih berbagai reward menarik mulai dari HP, Umroh, hingga Rumah Mewah impian Anda.',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'icon' => 'ShieldCheck',
                'title' => 'Sistem Aman & Terpercaya',
                'description' => 'Platform yang dikelola secara profesional dengan transparansi bonus yang tinggi.',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($features as $feature) {
            Feature::create($feature);
        }
    }
}
