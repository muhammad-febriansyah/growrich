<?php

namespace Database\Seeders;

use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UserRole;
use App\Models\MemberProfile;
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
            'email' => 'admin@growrich.id',
            'phone' => '081234567890',
            'referral_code' => strtoupper(Str::random(8)),
        ]);

        Wallet::create(['user_id' => $admin->id, 'balance' => 0]);

        // ── Root member (top of binary tree) ────────────────────────────────
        $root = User::factory()->create([
            'name' => 'Root Member',
            'email' => 'root@growrich.id',
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

        // ── Root Member profile (top of binary tree) ─────────────────────────
        MemberProfile::create([
            'user_id' => $root->id,
            'package_type' => PackageType::Platinum->value,
            'package_status' => 'active',
            'pin_code' => strtoupper(Str::random(4)).rand(1000, 9999),
            'activated_at' => now(),
            'parent_id' => null,
            'leg_position' => null,
            'left_child_id' => null,
            'right_child_id' => null,
            'left_pp_total' => 0,
            'right_pp_total' => 0,
            'left_rp_total' => 0,
            'right_rp_total' => 0,
            'career_level' => CareerLevel::Member->value,
            'leveling_rewarded_levels' => null,
        ]);

        // ── Registration PINs (depends on admin user) ────────────────────────
        $this->call(RegistrationPinSeeder::class);
    }
}
