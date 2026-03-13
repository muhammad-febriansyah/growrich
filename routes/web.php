<?php

use App\Http\Controllers\Admin\ResellerProgramController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Override Fortify's registration routes with our custom full-form registration
Route::middleware('guest')->group(function () {
    Route::get('register', [App\Http\Controllers\Auth\GuestRegistrationController::class, 'create'])->name('register');
    Route::post('register', [App\Http\Controllers\Auth\GuestRegistrationController::class, 'store'])->name('register.store');
});

Route::middleware('auth')->get('auth/redirect', function () {
    $role = auth()->user()?->role;
    $roleValue = $role instanceof \BackedEnum ? $role->value : $role;

    return $roleValue === 'admin'
        ? redirect()->route('admin.dashboard')
        : redirect()->route('dashboard');
})->name('auth.redirect');

Route::get('/', function () {
    $settings = \App\Models\SiteSetting::instance();
    $marketingBonuses = \App\Models\MarketingBonus::where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    return Inertia::render('welcome', [
        'hero' => [
            'badge' => $settings->hero_badge ?: 'Solusi Pertumbuhan Akurat',
            'title' => $settings->hero_title ?: 'Wujudkan',
            'title_highlight' => $settings->hero_title_highlight ?: 'Kebebasan Finansial',
            'title_suffix' => $settings->hero_title_suffix ?: '',
            'description' => $settings->hero_description ?: 'Platform ekosistem MLM modern yang dirancang untuk mempercepat karir dan pendapatan Anda dengan transparansi dan teknologi terkini.',
            'image_url' => $settings->hero_image ? \Illuminate\Support\Facades\Storage::url($settings->hero_image) : null,
            'stats_value' => $settings->hero_stats_value ?: '+128%',
            'stats_label' => $settings->hero_stats_label ?: 'Pertumbuhan',
        ],
        'sections' => [
            'features_badge' => $settings->features_section_badge,
            'features_title' => $settings->features_section_title,
            'features_highlight' => $settings->features_section_highlight,
            'features_description' => $settings->features_section_description,

            'packages_badge' => $settings->packages_section_badge,
            'packages_title' => $settings->packages_section_title,
            'packages_highlight' => $settings->packages_section_highlight,
            'packages_description' => $settings->packages_section_description,

            'marketing_badge' => $settings->marketing_section_badge,
            'marketing_title' => $settings->marketing_section_title,
            'marketing_highlight' => $settings->marketing_section_highlight,
            'marketing_description' => $settings->marketing_section_description,

            'career_title' => $settings->career_section_title,
            'career_highlight' => $settings->career_section_highlight,
            'career_description' => $settings->career_section_description,

            'steps_badge' => $settings->steps_section_badge,
            'steps_title' => $settings->steps_section_title,
            'steps_highlight' => $settings->steps_section_highlight,
            'steps_description' => $settings->steps_section_description,
        ],
        'features' => \App\Models\Feature::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'icon', 'title', 'description']),
        'marketingBonuses' => $marketingBonuses,
        'careerLevels' => collect(\App\Enums\Mlm\CareerLevel::cases())->map(fn ($l) => [
            'value' => $l->value,
            'label' => $l->label(),
            'required_pp' => $l->requiredPp(),
            'global_share_percent' => $l->globalSharePercent(),
        ]),
        'packages' => collect(\App\Enums\Mlm\PackageType::cases())->map(fn ($p) => [
            'name' => $p->value,
            'price' => $p->registrationPrice(),
            'pairing_point' => $p->pairingPoint(),
            'max_pairing' => $p->maxPairingPerDay(),
            'sponsor_bonus' => $p->sponsorBonus(),
            'is_popular' => $p === \App\Enums\Mlm\PackageType::Gold,
        ]),
        'testimonials' => \App\Models\Testimonial::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'role', 'avatar', 'content', 'rating']),
        'faqs' => \App\Models\Faq::where('is_published', true)
            ->orderBy('sort_order')
            ->get(['id', 'question', 'answer']),
    ]);
})->name('home');

Route::get('/about', function () {
    $page = \App\Models\LegalPage::where('slug', 'about-us')->firstOrFail();
    $page->image_url = $page->image ? \Illuminate\Support\Facades\Storage::url($page->image) : null;
    $features = \App\Models\Feature::where('is_active', true)
        ->orderBy('sort_order')
        ->get(['id', 'icon', 'title', 'description']);

    return Inertia::render('about', ['page' => $page, 'features' => $features]);
})->name('about');

Route::get('/faq', function () {
    $faqs = \App\Models\Faq::where('is_published', true)
        ->orderBy('sort_order')
        ->get(['id', 'question', 'answer']);

    return Inertia::render('faq', ['faqs' => $faqs]);
})->name('faq');

Route::get('/privacy', function () {
    $page = \App\Models\LegalPage::where('slug', 'privacy-policy')->firstOrFail(['title', 'content', 'updated_at']);

    return Inertia::render('legal/privacy', ['page' => $page]);
})->name('privacy');

Route::get('/blog', function (\Illuminate\Http\Request $request) {
    $search = $request->query('search');

    $posts = \App\Models\BlogPost::where('is_published', true)
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        })
        ->orderByDesc('published_at')
        ->paginate(6)
        ->withQueryString()
        ->through(fn ($p) => [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'excerpt' => $p->excerpt,
            'thumbnail_url' => $p->thumbnail_url,
            'published_at' => $p->published_at?->toDateString(),
        ]);

    return Inertia::render('blog/index', [
        'posts' => $posts,
        'filters' => [
            'search' => $search,
        ],
    ]);
})->name('blog');

Route::get('/blog/{slug}', function (string $slug) {
    $post = \App\Models\BlogPost::where('slug', $slug)
        ->where('is_published', true)
        ->firstOrFail();

    $related = \App\Models\BlogPost::where('is_published', true)
        ->where('id', '!=', $post->id)
        ->orderByDesc('published_at')
        ->limit(3)
        ->get()
        ->map(fn ($p) => [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'excerpt' => $p->excerpt,
            'thumbnail_url' => $p->thumbnail_url,
            'published_at' => $p->published_at?->toDateString(),
        ]);

    return Inertia::render('blog/show', [
        'post' => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'content' => $post->content,
            'excerpt' => $post->excerpt,
            'thumbnail_url' => $post->thumbnail_url,
            'published_at' => $post->published_at?->toDateString(),
        ],
        'related' => $related,
    ]);
})->name('blog.show');

Route::get('/produk', function () {
    $products = \App\Models\Product::active()
        ->orderBy('name')
        ->get(['id', 'name', 'description', 'sku', 'unit', 'image', 'regular_price', 'ro_price', 'member_discount', 'stock', 'bpom_number']);

    return Inertia::render('produk', [
        'products' => $products->map(fn (\App\Models\Product $p) => array_merge($p->toArray(), ['image_url' => $p->image_url])),
    ]);
})->name('produk');

Route::get('/produk/{product}', function (\App\Models\Product $product) {
    abort_if(! $product->is_active, 404);

    return Inertia::render('produk/show', [
        'product' => array_merge($product->toArray(), ['image_url' => $product->image_url]),
    ]);
})->name('produk.show');

Route::get('/paket', function () {
    return Inertia::render('paket', [
        'pairingBonusAmount' => \App\Models\Package::pairingBonusAmount(),
        'packages' => collect(\App\Enums\Mlm\PackageType::cases())->map(fn ($p) => [
            'name' => $p->value,
            'price' => $p->registrationPrice(),
            'pairing_point' => $p->pairingPoint(),
            'max_pairing' => $p->maxPairingPerDay(),
            'sponsor_bonus' => $p->sponsorBonus(),
            'reward_point' => $p->rewardPoint(),
            'upgrade_price' => $p->upgradePrice(),
            'next_package' => $p->next()?->value,
            'is_popular' => $p === \App\Enums\Mlm\PackageType::Gold,
        ]),
    ]);
})->name('paket');

Route::get('/find-a-mentor', function () {
    $settings = \App\Models\SiteSetting::instance();

    return Inertia::render('find-a-mentor', [
        'contact_whatsapp' => $settings->contact_whatsapp,
    ]);
})->name('find-a-mentor');

Route::get('/contact', function () {
    $settings = \App\Models\SiteSetting::instance();

    return Inertia::render('contact', [
        'contact' => [
            'email' => $settings->contact_email,
            'phone' => $settings->contact_phone,
            'whatsapp' => $settings->contact_whatsapp,
            'address' => $settings->contact_address,
            'google_maps_embed' => $settings->google_maps_embed,
        ],
        'socials' => [
            'facebook' => $settings->social_facebook,
            'instagram' => $settings->social_instagram,
            'twitter' => $settings->social_twitter,
            'youtube' => $settings->social_youtube,
            'tiktok' => $settings->social_tiktok,
        ],
    ]);
})->name('contact');

Route::get('/reseller-program', function () {
    $settings = \App\Models\ResellerProgramSetting::instance();
    $data = $settings->toArray();

    if (isset($data['cara_bergabung']) && is_array($data['cara_bergabung'])) {
        $data['cara_bergabung'] = collect($data['cara_bergabung'])->map(function ($item) {
            if (isset($item['image']) && $item['image']) {
                $item['image_url'] = \Illuminate\Support\Facades\Storage::url($item['image']);
            } else {
                $item['image_url'] = null;
            }

            return $item;
        })->toArray();
    }

    if (isset($data['trip_images']) && is_array($data['trip_images'])) {
        $data['trip_images_urls'] = collect($data['trip_images'])
            ->map(fn ($path) => \Illuminate\Support\Facades\Storage::url($path))
            ->toArray();
    }

    return Inertia::render('reseller-program', [
        'settings' => $data,
    ]);
})->name('reseller-program');

Route::get('/marketing-plan', function () {
    $marketingBonuses = \App\Models\MarketingBonus::where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    return Inertia::render('marketing-plan', [
        'packages' => \App\Models\Package::orderBy('sort_order')->get()->map(fn ($p) => [
            'name' => $p->name,
            'price' => $p->registration_price,
            'pairing_point' => $p->pairing_point,
            'max_pairing' => $p->max_pairing_per_day,
            'sponsor_bonus' => $p->sponsor_bonus_unit, // This might need logic if we want to show a range, but for now we use the base unit
        ]),
        'careerLevels' => \App\Models\CareerLevel::where('is_active', true)->orderBy('sort_order')->get(),
        'marketingBonuses' => $marketingBonuses,
    ]);
})->name('marketing-plan');

Route::get('/terms', function () {
    $page = \App\Models\LegalPage::where('slug', 'terms-conditions')->firstOrFail(['title', 'content', 'updated_at']);

    return Inertia::render('legal/terms', ['page' => $page]);
})->name('terms');

require __DIR__.'/settings.php';

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('admin/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('admin/members', [App\Http\Controllers\Admin\MemberController::class, 'index'])->name('admin.members.index');
    Route::get('admin/members/{user}', [App\Http\Controllers\Admin\MemberController::class, 'show'])->name('admin.members.show');
    Route::get('admin/members/{user}/edit', [App\Http\Controllers\Admin\MemberController::class, 'edit'])->name('admin.members.edit');
    Route::put('admin/members/{user}', [App\Http\Controllers\Admin\MemberController::class, 'update'])->name('admin.members.update');
    Route::post('admin/members/{user}/reset-password', [App\Http\Controllers\Admin\MemberController::class, 'resetPassword'])->name('admin.members.reset-password');
    Route::post('admin/members/{user}/toggle-stockist', [App\Http\Controllers\Admin\MemberController::class, 'toggleStockist'])->name('admin.members.toggle-stockist');
    Route::delete('admin/members/{user}', [App\Http\Controllers\Admin\MemberController::class, 'destroy'])->name('admin.members.destroy');
    Route::get('admin/member-deletions', [App\Http\Controllers\Admin\MemberDeletionController::class, 'index'])->name('admin.member-deletions.index');
    Route::delete('admin/member-deletions', [App\Http\Controllers\Admin\MemberDeletionController::class, 'bulkDestroy'])->name('admin.member-deletions.bulk-destroy');
    Route::delete('admin/member-deletions/{user}', [App\Http\Controllers\Admin\MemberDeletionController::class, 'destroy'])->name('admin.member-deletions.destroy');
    Route::get('admin/stockists', [App\Http\Controllers\Admin\StockistController::class, 'index'])->name('admin.stockists.index');

    Route::get('admin/pins', [App\Http\Controllers\Admin\PinController::class, 'index'])->name('admin.pins.index');
    Route::post('admin/pins', [App\Http\Controllers\Admin\PinController::class, 'store'])->name('admin.pins.store');
    Route::post('admin/pins/{pin}/expire', [App\Http\Controllers\Admin\PinController::class, 'expire'])->name('admin.pins.expire');
    Route::post('admin/pins/{pin}/assign', [App\Http\Controllers\Admin\PinController::class, 'assign'])->name('admin.pins.assign');

    Route::resource('admin/products', App\Http\Controllers\Admin\ProductController::class)->names('admin.products');

    Route::get('admin/bonuses', [App\Http\Controllers\Admin\BonusController::class, 'index'])->name('admin.bonuses.index');
    Route::get('admin/bonuses/{bonus}', [App\Http\Controllers\Admin\BonusController::class, 'show'])->name('admin.bonuses.show');
    Route::post('admin/bonuses/{bonus}/approve', [App\Http\Controllers\Admin\BonusController::class, 'approve'])->name('admin.bonuses.approve');
    Route::post('admin/bonuses/{bonus}/reject', [App\Http\Controllers\Admin\BonusController::class, 'reject'])->name('admin.bonuses.reject');

    Route::get('admin/withdrawals', [App\Http\Controllers\Admin\WithdrawalController::class, 'index'])->name('admin.withdrawals.index');
    Route::get('admin/withdrawals/{withdrawal}', [App\Http\Controllers\Admin\WithdrawalController::class, 'show'])->name('admin.withdrawals.show');
    Route::post('admin/withdrawals/{withdrawal}/approve', [App\Http\Controllers\Admin\WithdrawalController::class, 'approve'])->name('admin.withdrawals.approve');
    Route::post('admin/withdrawals/{withdrawal}/reject', [App\Http\Controllers\Admin\WithdrawalController::class, 'reject'])->name('admin.withdrawals.reject');

    Route::get('admin/settings', [App\Http\Controllers\Admin\SiteSettingController::class, 'index'])->name('admin.settings.index');
    Route::put('admin/settings', [App\Http\Controllers\Admin\SiteSettingController::class, 'update'])->name('admin.settings.update');

    Route::resource('admin/marketing-bonuses', App\Http\Controllers\Admin\MarketingBonusController::class)->names('admin.marketing-bonuses');
    Route::resource('admin/career-levels', App\Http\Controllers\Admin\CareerLevelController::class)->names('admin.career-levels');
    Route::resource('admin/banks', App\Http\Controllers\Admin\BankController::class)->names('admin.banks');

    Route::resource('admin/faqs', App\Http\Controllers\Admin\FaqController::class)->names('admin.faqs');

    Route::resource('admin/blog-posts', App\Http\Controllers\Admin\BlogPostController::class)->names('admin.blog-posts');
    Route::resource('admin/users', App\Http\Controllers\Admin\AdminUserController::class)->names('admin.users');
    Route::post('admin/users/{user}/reset-password', [App\Http\Controllers\Admin\AdminUserController::class, 'resetPassword'])->name('admin.users.reset-password');

    Route::get('admin/legal-pages/{slug}/edit', [\App\Http\Controllers\Admin\LegalPageController::class, 'edit'])->name('admin.legal-pages.edit');
    Route::put('admin/legal-pages/{slug}', [\App\Http\Controllers\Admin\LegalPageController::class, 'update'])->name('admin.legal-pages.update');

    // Daily Bonus Runs
    Route::get('admin/daily-runs', [App\Http\Controllers\Admin\DailyBonusRunController::class, 'index'])->name('admin.daily-runs.index');
    Route::get('admin/daily-runs/{dailyBonusRun}', [App\Http\Controllers\Admin\DailyBonusRunController::class, 'show'])->name('admin.daily-runs.show');
    Route::post('admin/daily-runs/trigger', [App\Http\Controllers\Admin\DailyBonusRunController::class, 'trigger'])->name('admin.daily-runs.trigger');
    Route::post('admin/daily-runs/trigger-monthly', [App\Http\Controllers\Admin\DailyBonusRunController::class, 'triggerMonthly'])->name('admin.daily-runs.trigger-monthly');

    // Reward Management
    Route::get('admin/rewards', [App\Http\Controllers\Admin\AdminRewardController::class, 'index'])->name('admin.rewards.index');
    Route::post('admin/rewards/{reward}/fulfill', [App\Http\Controllers\Admin\AdminRewardController::class, 'fulfill'])->name('admin.rewards.fulfill');
    Route::post('admin/rewards/{reward}/reject', [App\Http\Controllers\Admin\AdminRewardController::class, 'reject'])->name('admin.rewards.reject');

    // Upgrade Requests
    Route::get('upgrade-requests', [App\Http\Controllers\Admin\UpgradeRequestController::class, 'index'])->name('upgrade-requests.index');
    Route::post('upgrade-requests/{upgradeRequest}/approve', [App\Http\Controllers\Admin\UpgradeRequestController::class, 'approve'])->name('upgrade-requests.approve');
    Route::post('upgrade-requests/{upgradeRequest}/reject', [App\Http\Controllers\Admin\UpgradeRequestController::class, 'reject'])->name('upgrade-requests.reject');

    Route::resource('admin/features', App\Http\Controllers\Admin\FeatureController::class)->names('admin.features');

    Route::get('admin/reseller-program', [ResellerProgramController::class, 'index'])->name('admin.reseller-program.index');
    Route::put('admin/reseller-program', [ResellerProgramController::class, 'update'])->name('admin.reseller-program.update');

    Route::resource('admin/packages', App\Http\Controllers\Admin\PackageController::class)
        ->names('admin.packages');

    // Repeat Order Management
    Route::get('admin/repeat-orders', [App\Http\Controllers\Admin\RepeatOrderController::class, 'index'])->name('admin.repeat-orders.index');
    Route::get('admin/repeat-orders/{repeatOrder}', [App\Http\Controllers\Admin\RepeatOrderController::class, 'show'])->name('admin.repeat-orders.show');
    Route::post('admin/repeat-orders/{repeatOrder}/approve', [App\Http\Controllers\Admin\RepeatOrderController::class, 'approve'])->name('admin.repeat-orders.approve');
    Route::post('admin/repeat-orders/{repeatOrder}/reject', [App\Http\Controllers\Admin\RepeatOrderController::class, 'reject'])->name('admin.repeat-orders.reject');

    // PIN Order Management
    Route::get('admin/pin-orders', [App\Http\Controllers\Admin\PinOrderController::class, 'index'])->name('admin.pin-orders.index');
    Route::post('admin/pin-orders/{pinOrder}/complete', [App\Http\Controllers\Admin\PinOrderController::class, 'complete'])->name('admin.pin-orders.complete');
    Route::post('admin/pin-orders/{pinOrder}/ship', [App\Http\Controllers\Admin\PinOrderController::class, 'ship'])->name('admin.pin-orders.ship');
    Route::post('admin/pin-orders/{pinOrder}/cancel', [App\Http\Controllers\Admin\PinOrderController::class, 'cancel'])->name('admin.pin-orders.cancel');
    Route::get('admin/pin-orders/export', [App\Http\Controllers\Admin\PinOrderController::class, 'export'])->name('admin.pin-orders.export');

    // Database Backup
    Route::get('admin/database-backups', [App\Http\Controllers\Admin\DatabaseBackupController::class, 'index'])->name('admin.database-backups.index');
    Route::post('admin/database-backups', [App\Http\Controllers\Admin\DatabaseBackupController::class, 'store'])->name('admin.database-backups.store');
    Route::get('admin/database-backups/{filename}/download', [App\Http\Controllers\Admin\DatabaseBackupController::class, 'download'])->name('admin.database-backups.download');
    Route::delete('admin/database-backups/{filename}', [App\Http\Controllers\Admin\DatabaseBackupController::class, 'destroy'])->name('admin.database-backups.destroy');
});

Route::middleware(['auth', 'verified', 'role:member'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Member\DashboardController::class, 'index'])->name('dashboard');

    Route::get('member/profile', [App\Http\Controllers\Member\ProfileController::class, 'index'])->name('member.profile.index');
    Route::get('member/profile/edit', [App\Http\Controllers\Member\ProfileController::class, 'edit'])->name('member.profile.edit');
    Route::match(['PUT', 'POST'], 'member/profile', [App\Http\Controllers\Member\ProfileController::class, 'update'])->name('member.profile.update');

    Route::get('member/network', [App\Http\Controllers\Member\NetworkController::class, 'index'])->name('member.network.index');

    Route::get('member/wallet', [App\Http\Controllers\Member\FinancialController::class, 'wallet'])->name('member.wallet.index');
    Route::post('member/withdraw', [App\Http\Controllers\Member\FinancialController::class, 'withdraw'])->name('member.withdraw.store');
    Route::get('member/bonuses', [App\Http\Controllers\Member\FinancialController::class, 'bonuses'])->name('member.bonuses.index');

    Route::get('member/ro', [App\Http\Controllers\Member\OrderController::class, 'index'])->name('member.ro.index');
    Route::post('member/ro', [App\Http\Controllers\Member\OrderController::class, 'store'])->name('member.ro.store');

    Route::get('member/register', [App\Http\Controllers\Member\RegistrationController::class, 'index'])->name('member.register.index');
    Route::post('member/register', [App\Http\Controllers\Member\RegistrationController::class, 'store'])->name('member.register.store');

    Route::get('member/pins', [App\Http\Controllers\Member\PinController::class, 'index'])->name('member.pins.index');
    Route::post('member/pins/transfer', [App\Http\Controllers\Member\PinController::class, 'transfer'])->name('member.pins.transfer');
    Route::get('member/pins/lookup-member', [App\Http\Controllers\Member\PinController::class, 'lookupMember'])->name('member.pins.lookup-member');

    // PIN Orders
    Route::get('member/pin-orders', [App\Http\Controllers\Member\PinOrderController::class, 'index'])->name('member.pin-orders.index');
    Route::post('member/pin-orders', [App\Http\Controllers\Member\PinOrderController::class, 'store'])->name('member.pin-orders.store');
    Route::get('member/pin-orders/{order}', [App\Http\Controllers\Member\PinOrderController::class, 'show'])->name('member.pin-orders.show');
    Route::get('member/pin-orders/{order}/payment', [App\Http\Controllers\Member\PinOrderController::class, 'paymentPage'])->name('member.pin-orders.payment');
    Route::post('member/pin-orders/{order}/upload-receipt', [App\Http\Controllers\Member\PinOrderController::class, 'uploadReceipt'])->name('member.pin-orders.upload-receipt');

    Route::get('member/ro', [App\Http\Controllers\Member\OrderController::class, 'index'])->name('member.ro.index');
    Route::post('member/ro', [App\Http\Controllers\Member\OrderController::class, 'store'])->name('member.ro.store');
    Route::get('member/ro/{order}', [App\Http\Controllers\Member\OrderController::class, 'show'])->name('member.ro.show');
    Route::get('member/ro/{order}/payment', [App\Http\Controllers\Member\OrderController::class, 'paymentPage'])->name('member.ro.payment');
    Route::post('member/ro/{order}/upload-receipt', [App\Http\Controllers\Member\OrderController::class, 'uploadReceipt'])->name('member.ro.upload-receipt');

    // Upgrade Paket
    Route::get('member/upgrade', [App\Http\Controllers\Member\UpgradeController::class, 'index'])->name('member.upgrade.index');
    Route::post('member/upgrade', [App\Http\Controllers\Member\UpgradeController::class, 'store'])->name('member.upgrade.store');

    // Jenjang Karir
    Route::get('member/career', [App\Http\Controllers\Member\CareerController::class, 'index'])->name('member.career.index');

    // Progress Reward
    Route::get('member/rewards', [App\Http\Controllers\Member\RewardController::class, 'index'])->name('member.rewards.index');
});

// ── Duitku Payment Callbacks (no auth, CSRF exempted via bootstrap/app.php) ──
Route::post('payment/callback', [App\Http\Controllers\Payment\DuitkuCallbackController::class, 'handle'])->name('payment.callback');
Route::post('payment/callback/pin-order', [App\Http\Controllers\Payment\DuitkuCallbackController::class, 'pinOrder'])->name('payment.callback.pin-order');
Route::post('payment/callback/repeat-order', [App\Http\Controllers\Payment\DuitkuCallbackController::class, 'repeatOrder'])->name('payment.callback.repeat-order');
