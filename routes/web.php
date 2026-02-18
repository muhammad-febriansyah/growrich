<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::middleware('auth')->get('auth/redirect', function () {
    $role = auth()->user()?->role;
    $roleValue = $role instanceof \BackedEnum ? $role->value : $role;

    return $roleValue === 'admin'
        ? redirect()->route('admin.dashboard')
        : redirect()->route('dashboard');
})->name('auth.redirect');

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

require __DIR__ . '/settings.php';

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('admin/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('admin/members', [App\Http\Controllers\Admin\MemberController::class, 'index'])->name('admin.members.index');
    Route::get('admin/members/{user}', [App\Http\Controllers\Admin\MemberController::class, 'show'])->name('admin.members.show');
    Route::get('admin/members/{user}/edit', [App\Http\Controllers\Admin\MemberController::class, 'edit'])->name('admin.members.edit');
    Route::put('admin/members/{user}', [App\Http\Controllers\Admin\MemberController::class, 'update'])->name('admin.members.update');
    Route::post('admin/members/{user}/reset-password', [App\Http\Controllers\Admin\MemberController::class, 'resetPassword'])->name('admin.members.reset-password');

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

    Route::resource('admin/faqs', App\Http\Controllers\Admin\FaqController::class)->names('admin.faqs');

    Route::resource('admin/blog-posts', App\Http\Controllers\Admin\BlogPostController::class)->names('admin.blog-posts');
    Route::resource('admin/users', App\Http\Controllers\Admin\AdminUserController::class)->names('admin.users');
    Route::post('admin/users/{user}/reset-password', [App\Http\Controllers\Admin\AdminUserController::class, 'resetPassword'])->name('admin.users.reset-password');

    Route::get('admin/legal-pages/{slug}/edit', [\App\Http\Controllers\Admin\LegalPageController::class, 'edit'])->name('admin.legal-pages.edit');
    Route::put('admin/legal-pages/{slug}', [\App\Http\Controllers\Admin\LegalPageController::class, 'update'])->name('admin.legal-pages.update');
});

Route::middleware(['auth', 'verified', 'role:member'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Member\DashboardController::class, 'index'])->name('dashboard');

    Route::get('member/profile', [App\Http\Controllers\Member\ProfileController::class, 'index'])->name('member.profile.index');
    Route::get('member/profile/edit', [App\Http\Controllers\Member\ProfileController::class, 'edit'])->name('member.profile.edit');
    Route::put('member/profile', [App\Http\Controllers\Member\ProfileController::class, 'update'])->name('member.profile.update');

    Route::get('member/network', [App\Http\Controllers\Member\NetworkController::class, 'index'])->name('member.network.index');

    Route::get('member/wallet', [App\Http\Controllers\Member\FinancialController::class, 'wallet'])->name('member.wallet.index');
    Route::post('member/withdraw', [App\Http\Controllers\Member\FinancialController::class, 'withdraw'])->name('member.withdraw.store');
    Route::get('member/bonuses', [App\Http\Controllers\Member\FinancialController::class, 'bonuses'])->name('member.bonuses.index');

    Route::get('member/ro', [App\Http\Controllers\Member\OrderController::class, 'index'])->name('member.ro.index');
    Route::post('member/ro', [App\Http\Controllers\Member\OrderController::class, 'store'])->name('member.ro.store');

    Route::get('member/register', [App\Http\Controllers\Member\RegistrationController::class, 'index'])->name('member.register.index');
    Route::post('member/register', [App\Http\Controllers\Member\RegistrationController::class, 'store'])->name('member.register.store');

    Route::get('member/pins', [App\Http\Controllers\Member\PinController::class, 'index'])->name('member.pins.index');
});
