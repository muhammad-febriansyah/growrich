<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    /**
     * Display the site settings management page.
     */
    public function index()
    {
        $settings = SiteSetting::instance();

        $data = $settings->toArray();
        $data['logo_url'] = $settings->logo ? Storage::url($settings->logo) : null;
        $data['favicon_url'] = $settings->favicon ? Storage::url($settings->favicon) : null;
        $data['hero_image_url'] = $settings->hero_image ? Storage::url($settings->hero_image) : null;

        return Inertia::render('admin/settings/index', [
            'settings' => $data,
        ]);
    }

    /**
     * Update the site settings.
     */
    public function update(Request $request)
    {
        $settings = SiteSetting::instance();

        $validated = $request->validate([
            // General
            'site_name' => 'nullable|string|max:255',
            'site_tagline' => 'nullable|string|max:255',
            'site_description' => 'nullable|string',
            // Branding
            'logo' => 'nullable|image|max:2048',
            'favicon' => 'nullable|image|max:1024',
            // Contact
            'contact_phone' => 'nullable|string|max:255',
            'contact_whatsapp' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_address' => 'nullable|string',
            // Social Media
            'social_facebook' => 'nullable|url|max:255',
            'social_instagram' => 'nullable|url|max:255',
            'social_twitter' => 'nullable|url|max:255',
            'social_youtube' => 'nullable|url|max:255',
            'social_tiktok' => 'nullable|url|max:255',
            // SEO
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            // Footer
            'footer_text' => 'nullable|string',
            'copyright_text' => 'nullable|string|max:255',
            // Hero
            'hero_badge' => 'nullable|string|max:255',
            'hero_title' => 'nullable|string|max:255',
            'hero_title_highlight' => 'nullable|string|max:255',
            'hero_description' => 'nullable|string',
            'hero_image' => 'nullable|image|max:4096',
            'hero_stats_value' => 'nullable|string|max:50',
            'hero_stats_label' => 'nullable|string|max:100',
        ]);

        foreach (['logo', 'favicon', 'hero_image'] as $fileKey) {
            if ($request->hasFile($fileKey)) {
                if ($settings->{$fileKey}) {
                    Storage::disk('public')->delete($settings->{$fileKey});
                }
                $validated[$fileKey] = $request->file($fileKey)->store('branding', 'public');
            } else {
                unset($validated[$fileKey]);
            }
        }

        $settings->update($validated);

        return back()->with('success', 'Pengaturan situs berhasil diperbarui.');
    }
}
