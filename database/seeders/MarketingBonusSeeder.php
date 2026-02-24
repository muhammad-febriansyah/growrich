<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MarketingBonusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bonuses = [
            [
                'category' => 'daily',
                'icon' => 'UserPlus',
                'icon_color' => 'bg-primary/10 text-primary',
                'tag' => 'Instan',
                'tag_color' => 'bg-primary/10 text-primary',
                'title' => 'Bonus Sponsor',
                'description' => 'Diterima langsung saat berhasil merekrut member baru ke jaringan Anda.',
                'details' => [
                    ['label' => 'Silver × Siapapun', 'value' => 'Rp 200.000'],
                    ['label' => 'Gold × Gold/Platinum', 'value' => 'Rp 400.000'],
                    ['label' => 'Platinum × Platinum', 'value' => 'Rp 600.000'],
                ],
                'sort_order' => 1,
            ],
            [
                'category' => 'daily',
                'icon' => 'GitBranch',
                'icon_color' => 'bg-emerald-50 text-emerald-600',
                'tag' => 'Setiap Hari',
                'tag_color' => 'bg-emerald-50 text-emerald-600',
                'title' => 'Bonus Pairing',
                'description' => 'Rp 100.000 per pasang dari pencocokan jaringan binary kiri & kanan.',
                'details' => [
                    ['label' => 'Silver', 'value' => 'Maks. 10 pasang/hari'],
                    ['label' => 'Gold', 'value' => 'Maks. 20 pasang/hari'],
                    ['label' => 'Platinum', 'value' => 'Maks. 30 pasang/hari'],
                ],
                'sort_order' => 2,
            ],
            [
                'category' => 'daily',
                'icon' => 'Share2',
                'icon_color' => 'bg-violet-50 text-violet-600',
                'tag' => 'Setiap Hari',
                'tag_color' => 'bg-violet-50 text-violet-600',
                'title' => 'Bonus Matching',
                'description' => 'Persentase dari pairing bonus downline hingga 10 generasi ke bawah.',
                'details' => [
                    ['label' => 'Generasi 1–4', 'value' => '15%'],
                    ['label' => 'Generasi 5–6', 'value' => '10%'],
                    ['label' => 'Generasi 7–10', 'value' => '5%'],
                ],
                'sort_order' => 3,
            ],
            [
                'category' => 'daily',
                'icon' => 'Layers',
                'icon_color' => 'bg-amber-50 text-amber-600',
                'tag' => 'Setiap Hari',
                'tag_color' => 'bg-amber-50 text-amber-600',
                'title' => 'Bonus Leveling',
                'description' => 'Berdasarkan kombinasi paket kiri & kanan direct downline Anda.',
                'details' => [
                    ['label' => 'Silver + Silver', 'value' => 'Rp 250.000'],
                    ['label' => 'Gold + Gold', 'value' => 'Rp 500.000'],
                    ['label' => 'Platinum + Platinum', 'value' => 'Rp 750.000'],
                ],
                'sort_order' => 4,
            ],
            [
                'category' => 'monthly',
                'icon' => 'RefreshCw',
                'icon_color' => 'bg-sky-50 text-sky-600',
                'tag' => 'Per Bulan',
                'tag_color' => 'bg-sky-50 text-sky-600',
                'title' => 'Bonus Repeat Order',
                'description' => '5% dari total omset Repeat Order downline G1–G7 dalam satu bulan.',
                'details' => [
                    ['label' => 'Syarat Pribadi', 'value' => 'RO ≥ Rp 1 jt/bulan'],
                    ['label' => 'Komisi Downline', 'value' => '5% dari total RO'],
                    ['label' => 'Jangkauan', 'value' => 'Generasi 1–7'],
                ],
                'sort_order' => 5,
            ],
            [
                'category' => 'monthly',
                'icon' => 'Globe',
                'icon_color' => 'bg-rose-50 text-rose-600',
                'tag' => 'Per Bulan',
                'tag_color' => 'bg-rose-50 text-rose-600',
                'title' => 'Bonus Global Sharing',
                'description' => 'Bagian dari pool omset nasional yang dibagi rata ke seluruh member per level karir.',
                'details' => [
                    ['label' => 'Syarat Pribadi', 'value' => 'RO ≥ Rp 1 jt/bulan'],
                    ['label' => 'Sumber Pool', 'value' => 'Omset RO Nasional'],
                    ['label' => 'Share per Level', 'value' => '1% – 3%'],
                ],
                'sort_order' => 6,
            ],
        ];

        foreach ($bonuses as $bonus) {
            \App\Models\MarketingBonus::create($bonus);
        }
    }
}
