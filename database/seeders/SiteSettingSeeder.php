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
            ]
        );
    }
}
