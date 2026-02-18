<?php

namespace Database\Seeders;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Models\Bonus;
use App\Models\DailyBonusRun;
use App\Models\MemberProfile;
use App\Models\Product;
use App\Models\RepeatOrder;
use App\Models\RepeatOrderItem;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MlmNetworkSeeder extends Seeder
{
    /**
     * Seed a realistic 15-member binary tree.
     *
     * PP thresholds (per leg):
     *   Core Loader       =    25 PP
     *   Sapphire Manager  =   100 PP
     *   Ruby Manager      =   500 PP
     *   Emerald Manager   = 1.000 PP
     *   Diamond Manager   = 5.000 PP
     *   Blue Diamond Mgr  = 10.000 PP
     *   Elite Team Global = 25.000 PP
     *
     * RP per registration: Silver=0, Gold=1, Platinum=2
     *
     *                     root(1)
     *                   /         \
     *               L(2)            R(3)
     *             /     \          /     \
     *           LL(4)  LR(5)    RL(6)   RR(7)
     *          / \     / \      / \      / \
     *        (8)(9) (10)(11) (12)(13) (14)(15)
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $products = Product::all();

        // ── 1. Member data ──────────────────────────────────────────────────
        // [name, email, package, career_level, left_pp, right_pp]
        // RP = accumulated RP from downline. Silver contributes 0, Gold 1, Plat 2 per registration.
        // For demo: RP is approximated as ~60% of PP (mixed Gold/Platinum network)
        $memberData = [
            // Root — Diamond Manager (5000:5000 PP each leg)
            ['Budi Santoso', 'budi@example.com', PackageType::Platinum, CareerLevel::DiamondManager, 5_200, 5_100],
            // L2 — Emerald Manager (1000:1000 PP each leg)
            ['Siti Rahayu', 'siti@example.com', PackageType::Gold, CareerLevel::EmeraldManager, 1_100, 1_050],
            // R2 — Emerald Manager
            ['Ahmad Fauzi', 'ahmad@example.com', PackageType::Gold, CareerLevel::EmeraldManager, 1_080, 1_020],
            // L2-L — Ruby Manager (500:500 PP each leg)
            ['Dewi Lestari', 'dewi@example.com', PackageType::Silver, CareerLevel::RubyManager, 520, 510],
            // L2-R — Ruby Manager
            ['Eko Prasetyo', 'eko@example.com', PackageType::Gold, CareerLevel::RubyManager, 540, 505],
            // R2-L — Sapphire Manager (100:100 PP each leg)
            ['Fitri Handayani', 'fitri@example.com', PackageType::Silver, CareerLevel::SapphireManager, 110, 105],
            // R2-R — Ruby Manager
            ['Galih Purnomo', 'galih@example.com', PackageType::Platinum, CareerLevel::RubyManager, 560, 530],
            // Level 3 members — Core Loader (25:25 PP each leg)
            ['Hana Wijaya', 'hana@example.com', PackageType::Silver, CareerLevel::CoreLoader, 30, 27],
            ['Ivan Kurniawan', 'ivan@example.com', PackageType::Silver, CareerLevel::CoreLoader, 28, 26],
            ['Joko Susilo', 'joko@example.com', PackageType::Gold, CareerLevel::CoreLoader, 32, 29],
            ['Kartika Sari', 'kartika@example.com', PackageType::Silver, CareerLevel::CoreLoader, 27, 25],
            // Level 3 members — Member (below 25 PP each leg)
            ['Lina Marlina', 'lina@example.com', PackageType::Gold, CareerLevel::Member, 12, 10],
            ['Maman Sulaiman', 'maman@example.com', PackageType::Silver, CareerLevel::Member, 8, 6],
            ['Nina Agustina', 'nina@example.com', PackageType::Platinum, CareerLevel::Member, 18, 15],
            ['Oscar Pratama', 'oscar@example.com', PackageType::Silver, CareerLevel::Member, 5, 3],
        ];

        $users = [];
        $profiles = [];

        foreach ($memberData as $index => $data) {
            $user = User::create([
                'name' => $data[0],
                'email' => $data[1],
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'phone' => fake()->numerify('08##########'),
                'referral_code' => strtoupper(Str::random(8)),
                'sponsor_id' => $index === 0 ? null : $users[0]->id,
                'role' => 'member',
            ]);

            $users[] = $user;
        }

        // ── 2. Build binary tree profiles ──────────────────────────────────
        $treeMap = [
            0  => [null, null],
            1  => [0, 'left'],
            2  => [0, 'right'],
            3  => [1, 'left'],
            4  => [1, 'right'],
            5  => [2, 'left'],
            6  => [2, 'right'],
            7  => [3, 'left'],
            8  => [3, 'right'],
            9  => [4, 'left'],
            10 => [4, 'right'],
            11 => [5, 'left'],
            12 => [5, 'right'],
            13 => [6, 'left'],
            14 => [6, 'right'],
        ];

        foreach ($users as $index => $user) {
            $data = $memberData[$index];
            [$parentIndex, $leg] = $treeMap[$index];

            // RP per leg: accumulated from downline registrations (Gold=1, Platinum=2 per reg)
            $leftRp = (int) round($data[4] * 0.6);
            $rightRp = (int) round($data[5] * 0.6);

            $profile = MemberProfile::create([
                'user_id' => $user->id,
                'package_type' => $data[2]->value,
                'package_status' => 'active',
                'pin_code' => strtoupper(Str::random(4)).rand(1000, 9999),
                'activated_at' => Carbon::now()->subDays(rand(10, 365)),
                'parent_id' => $parentIndex !== null ? ($profiles[$parentIndex]->id ?? null) : null,
                'leg_position' => $leg,
                'left_child_id' => null,
                'right_child_id' => null,
                'left_pp_total' => $data[4],
                'right_pp_total' => $data[5],
                'left_rp_total' => $leftRp,
                'right_rp_total' => $rightRp,
                'career_level' => $data[3]->value,
            ]);

            $profiles[] = $profile;
        }

        // ── 3. Wire up left_child_id / right_child_id ──────────────────────
        foreach ($treeMap as $index => [$parentIndex, $leg]) {
            if ($parentIndex === null) {
                continue;
            }

            $column = $leg === 'left' ? 'left_child_id' : 'right_child_id';
            $profiles[$parentIndex]->update([$column => $profiles[$index]->id]);
        }

        // ── 4. Create wallets ────────────────────────────────────────────────
        foreach ($users as $user) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => fake()->numberBetween(0, 5_000_000),
            ]);

            // Seed a few wallet transactions for realism
            $txCount = rand(2, 5);
            $running = $wallet->balance;
            for ($t = 0; $t < $txCount; $t++) {
                $amount = fake()->numberBetween(50_000, 500_000);
                $type = fake()->randomElement(['credit', 'debit']);
                $before = $running;
                $after = $type === 'credit' ? $before + $amount : max(0, $before - $amount);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => $type,
                    'amount' => $amount,
                    'description' => $type === 'credit' ? 'Bonus kredit' : 'Penarikan dana',
                    'reference_type' => null,
                    'reference_id' => null,
                    'balance_before' => $before,
                    'balance_after' => $after,
                ]);

                $running = $after;
            }
        }

        // ── 5. Create repeat orders ──────────────────────────────────────────
        if ($products->isNotEmpty()) {
            $currentMonth = (int) now()->format('n');
            $currentYear = (int) now()->format('Y');

            // Active members who have RO (at least min Rp 1 Juta)
            foreach (array_slice($profiles, 0, 10) as $profile) {
                for ($m = 1; $m <= 3; $m++) {
                    $month = $currentMonth - $m <= 0 ? $currentMonth - $m + 12 : $currentMonth - $m;
                    $year = $currentMonth - $m <= 0 ? $currentYear - 1 : $currentYear;

                    $order = RepeatOrder::create([
                        'member_profile_id' => $profile->id,
                        'order_number' => 'RO-'.$year.'-'.fake()->unique()->numerify('######'),
                        'total_amount' => 0,
                        'status' => 'completed',
                        'period_month' => $month,
                        'period_year' => $year,
                    ]);

                    $total = 0;
                    // Pick 2-4 products to ensure total >= 1 juta
                    $selected = $products->random(min(4, $products->count()));

                    foreach ($selected as $product) {
                        $qty = rand(1, 5);
                        $subtotal = $qty * $product->ro_price;
                        $total += $subtotal;

                        RepeatOrderItem::create([
                            'repeat_order_id' => $order->id,
                            'product_id' => $product->id,
                            'quantity' => $qty,
                            'unit_price' => $product->ro_price,
                            'subtotal' => $subtotal,
                        ]);
                    }

                    $order->update(['total_amount' => $total]);
                }
            }
        }

        // ── 6. DailyBonusRun records ─────────────────────────────────────────
        $bonusRuns = [];
        for ($d = 1; $d <= 7; $d++) {
            $runDate = Carbon::now()->subDays($d);
            $run = DailyBonusRun::create([
                'run_date' => $runDate->format('Y-m-d'),
                'status' => 'completed',
                'started_at' => $runDate->copy()->setTime(0, 30),
                'completed_at' => $runDate->copy()->setTime(0, 35),
                'total_pairing_bonus' => fake()->numberBetween(500_000, 10_000_000),
                'total_matching_bonus' => fake()->numberBetween(200_000, 3_000_000),
                'total_leveling_bonus' => fake()->numberBetween(250_000, 2_000_000),
            ]);
            $bonusRuns[] = $run;
        }

        // ── 7. Bonuses ────────────────────────────────────────────────────────
        $dailyBonusTypes = [BonusType::Pairing, BonusType::Matching, BonusType::Leveling, BonusType::Sponsor];
        $monthlyBonusTypes = [BonusType::RepeatOrder, BonusType::GlobalSharing];

        foreach ($profiles as $profile) {
            // Daily bonuses (last 7 days)
            foreach ($dailyBonusTypes as $bonusType) {
                $amount = fake()->numberBetween(100_000, 1_000_000);
                $ewalletAmount = (int) ($amount * 0.2);
                $cashAmount = $amount - $ewalletAmount;
                $bonusDate = Carbon::now()->subDays(rand(1, 7));

                Bonus::create([
                    'member_profile_id' => $profile->id,
                    'bonus_type' => $bonusType->value,
                    'amount' => $amount,
                    'ewallet_amount' => $ewalletAmount,
                    'cash_amount' => $cashAmount,
                    'status' => fake()->randomElement([
                        BonusStatus::Pending->value,
                        BonusStatus::Approved->value,
                        BonusStatus::Paid->value,
                    ]),
                    'approved_by' => $admin?->id,
                    'bonus_date' => $bonusDate->format('Y-m-d'),
                    'period_month' => null,
                    'period_year' => null,
                    'meta' => null,
                    'daily_bonus_run_id' => $bonusRuns[array_rand($bonusRuns)]->id,
                ]);
            }

            // Monthly bonuses (last 2 months)
            foreach ($monthlyBonusTypes as $bonusType) {
                for ($m = 1; $m <= 2; $m++) {
                    $amount = fake()->numberBetween(200_000, 5_000_000);
                    $ewalletAmount = (int) ($amount * 0.2);
                    $cashAmount = $amount - $ewalletAmount;
                    $period = Carbon::now()->subMonths($m);

                    Bonus::create([
                        'member_profile_id' => $profile->id,
                        'bonus_type' => $bonusType->value,
                        'amount' => $amount,
                        'ewallet_amount' => $ewalletAmount,
                        'cash_amount' => $cashAmount,
                        'status' => BonusStatus::Paid->value,
                        'approved_by' => $admin?->id,
                        'bonus_date' => $period->endOfMonth()->format('Y-m-d'),
                        'period_month' => (int) $period->format('n'),
                        'period_year' => (int) $period->format('Y'),
                        'meta' => null,
                        'daily_bonus_run_id' => null,
                    ]);
                }
            }
        }

        // ── 8. Withdrawals ────────────────────────────────────────────────────
        $banks = ['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI', 'CIMB Niaga'];

        foreach (array_slice($users, 0, 8) as $user) {
            Withdrawal::create([
                'user_id' => $user->id,
                'amount' => fake()->numberBetween(100_000, 3_000_000),
                'bank_name' => fake()->randomElement($banks),
                'account_number' => fake()->numerify('##############'),
                'account_name' => $user->name,
                'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
                'processed_by' => $admin?->id,
            ]);
        }
    }
}
