<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::updateOrCreate(
            ['id' => 1],
            [
                'site_name' => 'GrowRich',
                'site_tagline' => 'Creating Fantastic Life',
                'site_description' => 'Platform MLM MOIREA — sistem bisnis terbaru, terlengkap, terbesar, dan tercepat di Asia.',
                'logo' => null,
                'logo_dark' => null,
                'favicon' => null,
                'meta_title' => 'GrowRich — MOIREA Marketing Plan',
                'meta_description' => 'Bergabunglah dengan GrowRich dan raih kebebasan finansial bersama MOIREA.',
                'meta_keywords' => 'moirea, mlm, growrich, bisnis, marketing plan',
                'og_image' => null,
                'contact_phone' => null,
                'contact_whatsapp' => null,
                'contact_email' => null,
                'contact_address' => null,
                'social_facebook' => null,
                'social_instagram' => null,
                'social_twitter' => null,
                'social_youtube' => null,
                'social_tiktok' => null,
                'google_maps_url' => null,
                'google_maps_embed' => null,
                'google_analytics_id' => null,
                'footer_text' => null,
                'copyright_text' => '© '.date('Y').' GrowRich. All rights reserved.',

                // Hero
                'hero_badge' => 'Solusi Pertumbuhan Akurat',
                'hero_title' => 'Wujudkan',
                'hero_title_highlight' => 'Kebebasan Finansial',
                'hero_title_suffix' => 'Bersama Kami',
                'hero_description' => 'Platform ekosistem MLM modern yang dirancang untuk mempercepat karir dan pendapatan Anda dengan transparansi dan teknologi terkini.',

                // Features
                'features_section_badge' => 'Fitur Unggulan',
                'features_section_title' => 'Mengapa Memilih',
                'features_section_highlight' => 'GrowRich?',
                'features_section_description' => 'Platform lengkap yang dirancang untuk mempercepat pertumbuhan bisnis MLM Anda.',

                // Packages
                'packages_section_badge' => 'Paket Bergabung',
                'packages_section_title' => 'Pilih Paket',
                'packages_section_highlight' => 'Terbaik Anda',
                'packages_section_description' => 'Mulai perjalanan bisnis Anda dengan paket yang sesuai. Upgrade kapan saja seiring pertumbuhan jaringan Anda.',

                // Marketing
                'marketing_section_badge' => 'Marketing Plan',
                'marketing_section_title' => '6 Jenis',
                'marketing_section_highlight' => 'Bonus Menggiurkan',
                'marketing_section_description' => 'Sistem jaringan binary dengan 6 jalur bonus transparan yang mengalir setiap hari dan setiap bulan.',

                // Career
                'career_section_title' => 'Jalur Karir',
                'career_section_highlight' => 'Global Sharing',
                'career_section_description' => 'Level karir naik otomatis saat syarat Pairing Point terpenuhi pada kedua kaki jaringan Anda.',

                // Steps
                'steps_section_badge' => 'Cara Bergabung',
                'steps_section_title' => 'Mulai dalam',
                'steps_section_highlight' => '4 Langkah',
                'steps_section_description' => 'Proses bergabung yang mudah dan cepat. Dalam hitungan menit, akun Anda sudah aktif dan siap membangun jaringan.',
            ]
        );
    }
}
