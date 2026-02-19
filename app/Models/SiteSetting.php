<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        // General
        'site_name',
        'site_tagline',
        'site_description',
        // Branding
        'logo',
        'favicon',
        // SEO
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
        // Contact
        'contact_phone',
        'contact_whatsapp',
        'contact_email',
        'contact_address',
        // Social Media
        'social_facebook',
        'social_instagram',
        'social_twitter',
        'social_youtube',
        'social_tiktok',
        // Google
        'google_maps_url',
        'google_maps_embed',
        'google_analytics_id',
        // Footer
        'footer_text',
        'copyright_text',
        // Hero Section
        'hero_badge',
        'hero_title',
        'hero_title_highlight',
        'hero_description',
        'hero_image',
        'hero_stats_value',
        'hero_stats_label',
    ];

    /**
     * Get the singleton instance, creating a default row if none exists.
     */
    public static function instance(): static
    {
        return static::firstOrCreate(
            ['id' => 1],
            ['site_name' => config('app.name', 'GrowRich')]
        );
    }
}
