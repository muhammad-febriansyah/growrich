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
        'email_sender',
        'email_token',
        'duitku_merchant_code',
        'duitku_api_key',
        'duitku_is_sandbox',
        'biteship_api_key',
        'biteship_origin_postal_code',
        'biteship_dummy_mode',
        // Diskon & Ketentuan PIN Stokis
        'stockist_min_order',
        'stockist_discount_percent',
        'volume_discount_5_percent',
        'volume_discount_10_percent',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'nocaptcha_sitekey',
        'nocaptcha_secret',
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
        'hero_title_suffix',
        // Landing Page Sections
        'features_section_badge',
        'features_section_title',
        'features_section_highlight',
        'features_section_description',
        'packages_section_badge',
        'packages_section_title',
        'packages_section_highlight',
        'packages_section_description',
        'marketing_section_badge',
        'marketing_section_title',
        'marketing_section_highlight',
        'marketing_section_description',
        'career_section_title',
        'career_section_highlight',
        'career_section_description',
        'steps_section_badge',
        'steps_section_title',
        'steps_section_highlight',
        'steps_section_description',
        // Bonus
        'pairing_bonus_amount',
    ];

    protected $casts = [
        'duitku_is_sandbox' => 'boolean',
        'biteship_dummy_mode' => 'boolean',
        'pairing_bonus_amount' => 'integer',
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
