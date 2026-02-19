<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = \App\Models\SiteSetting::instance();
        $site = [
            'name' => $settings->site_name ?? config('app.name'),
            'logo' => $settings->logo ? \Illuminate\Support\Facades\Storage::url($settings->logo) : null,
            'favicon' => $settings->favicon ? \Illuminate\Support\Facades\Storage::url($settings->favicon) : null,
        ];

        $socials = array_filter([
            'facebook' => $settings->social_facebook ?: null,
            'instagram' => $settings->social_instagram ?: null,
            'twitter' => $settings->social_twitter ?: null,
            'youtube' => $settings->social_youtube ?: null,
            'tiktok' => $settings->social_tiktok ?: null,
        ]);

        $contact = [
            'email' => $settings->contact_email ?: null,
            'phone' => $settings->contact_phone ?: null,
            'whatsapp' => $settings->contact_whatsapp ?: null,
            'address' => $settings->contact_address ?: null,
        ];

        return [
            ...parent::share($request),
            'site' => $site,
            'socials' => $socials,
            'contact' => $contact,
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
