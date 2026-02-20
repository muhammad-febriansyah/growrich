<?php

namespace Database\Seeders;

use App\Enums\Mlm\UserRole;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ───────────────────────────────────────────────────────
        $admin = User::factory()->admin()->create([
            'name' => 'Admin GrowRich',
            'email' => 'admin@growrich.com',
            'phone' => '081234567890',
            'referral_code' => strtoupper(Str::random(8)),
        ]);

        Wallet::create(['user_id' => $admin->id, 'balance' => 0]);

        // ── Root member (top of binary tree) ────────────────────────────────
        $root = User::factory()->create([
            'name' => 'Root Member',
            'email' => 'root@growrich.com',
            'phone' => '089876543210',
            'referral_code' => strtoupper(Str::random(8)),
            'role' => UserRole::Member->value,
        ]);

        Wallet::create(['user_id' => $root->id, 'balance' => 0]);

        // ── Reference data (no FK deps) ──────────────────────────────────────
        $this->call([
            PackageSeeder::class,
            SiteSettingSeeder::class,
            ProductSeeder::class,
            RewardMilestoneSeeder::class,
        ]);

        // ── Demo network (depends on products & milestones) ──────────────────
        $this->call(MlmNetworkSeeder::class);

        // ── Registration PINs (depends on admin user) ────────────────────────
        $this->call(RegistrationPinSeeder::class);
    }
}
