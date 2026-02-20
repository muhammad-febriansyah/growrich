<?php

namespace App\Services;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Models\Bonus;
use App\Models\DailyBonusRun;
use App\Models\MemberProfile;
use App\Models\MemberReward;
use App\Models\Package;
use App\Models\RepeatOrder;
use App\Models\RewardMilestone;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BonusRunnerService
{
    // ── Daily Runner ──────────────────────────────────────────────────────────

    /**
     * Run all daily bonuses (Pairing, Matching, Leveling) for a given date.
     * Idempotent: skips if a completed run already exists for that date.
     */
    public function runDaily(Carbon $date): DailyBonusRun
    {
        $existing = DailyBonusRun::where('run_date', $date->toDateString())
            ->where('status', 'completed')
            ->first();

        if ($existing) {
            Log::info("Daily bonus run already completed for {$date->toDateString()}, skipping.");

            return $existing;
        }

        $run = DailyBonusRun::create([
            'run_date' => $date->toDateString(),
            'status' => 'running',
            'started_at' => now(),
        ]);

        try {
            DB::transaction(function () use ($run, $date) {
                $this->runPairingBonus($run, $date);
                $this->runMatchingBonus($run, $date);
                $this->runLevelingBonus($run, $date);
                $this->autoUpgradeCareerLevels();
                $this->triggerRewards();
            });

            $run->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            $run->update(['status' => 'failed']);
            Log::error("Daily bonus run failed: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }

        return $run->fresh();
    }

    // ── Pairing Bonus ─────────────────────────────────────────────────────────

    /**
     * Rp 100.000 per matched pair (min of left/right PP).
     * Capped by member's package maxPairingPerDay.
     */
    private function runPairingBonus(DailyBonusRun $run, Carbon $date): void
    {
        $profiles = MemberProfile::where('package_status', 'active')
            ->with('user')
            ->get();

        $totalPairing = 0;

        foreach ($profiles as $profile) {
            $leftPp = (int) $profile->left_pp_total;
            $rightPp = (int) $profile->right_pp_total;

            if ($leftPp <= 0 || $rightPp <= 0) {
                continue;
            }

            $pairs = min($leftPp, $rightPp);

            // Cap by package
            $packageType = $profile->package_type instanceof PackageType
                ? $profile->package_type
                : PackageType::from($profile->package_type);

            $pairs = min($pairs, $packageType->maxPairingPerDay());

            if ($pairs <= 0) {
                continue;
            }

            $amount = $pairs * PackageType::pairingBonusAmount();
            $ewalletAmount = (int) ($amount * 0.2);
            $cashAmount = $amount - $ewalletAmount;

            Bonus::create([
                'member_profile_id' => $profile->id,
                'bonus_type' => BonusType::Pairing->value,
                'amount' => $amount,
                'ewallet_amount' => $ewalletAmount,
                'cash_amount' => $cashAmount,
                'status' => BonusStatus::Pending->value,
                'bonus_date' => $date->toDateString(),
                'period_month' => $date->month,
                'period_year' => $date->year,
                'daily_bonus_run_id' => $run->id,
                'meta' => ['pairs' => $pairs, 'left_pp' => $leftPp, 'right_pp' => $rightPp],
            ]);

            $totalPairing += $amount;

            // Flush PP after pairing (consume the matched pairs)
            $usedPp = $pairs;
            $profile->decrement('left_pp_total', $usedPp);
            $profile->decrement('right_pp_total', $usedPp);
        }

        $run->increment('total_pairing_bonus', $totalPairing);
    }

    // ── Matching Bonus ────────────────────────────────────────────────────────

    /**
     * Percentage of downline's Pairing Bonus:
     * G1=15%, G2-G4=15%, G5-G6=10%, G7-G10=5%
     */
    private function runMatchingBonus(DailyBonusRun $run, Carbon $date): void
    {
        $pairingBonuses = Bonus::where('daily_bonus_run_id', $run->id)
            ->where('bonus_type', BonusType::Pairing->value)
            ->with('memberProfile')
            ->get();

        $totalMatching = 0;

        foreach ($pairingBonuses as $pairingBonus) {
            $downlineProfile = $pairingBonus->memberProfile;
            if (! $downlineProfile) {
                continue;
            }

            // Walk up the tree, distributing matching bonus
            $current = $downlineProfile;
            $generation = 1;

            while ($current->parent_id && $generation <= 10) {
                $ancestor = MemberProfile::where('id', $current->parent_id)
                    ->where('package_status', 'active')
                    ->first();

                if (! $ancestor) {
                    break;
                }

                $percent = $this->matchingPercent($generation);

                if ($percent > 0) {
                    $amount = (int) ($pairingBonus->amount * $percent / 100);
                    $ewalletAmount = (int) ($amount * 0.2);
                    $cashAmount = $amount - $ewalletAmount;

                    Bonus::create([
                        'member_profile_id' => $ancestor->id,
                        'bonus_type' => BonusType::Matching->value,
                        'amount' => $amount,
                        'ewallet_amount' => $ewalletAmount,
                        'cash_amount' => $cashAmount,
                        'status' => BonusStatus::Pending->value,
                        'bonus_date' => $date->toDateString(),
                        'period_month' => $date->month,
                        'period_year' => $date->year,
                        'daily_bonus_run_id' => $run->id,
                        'meta' => [
                            'generation' => $generation,
                            'percent' => $percent,
                            'source_bonus_id' => $pairingBonus->id,
                            'source_profile_id' => $downlineProfile->id,
                        ],
                    ]);

                    $totalMatching += $amount;
                }

                $current = $ancestor;
                $generation++;
            }
        }

        $run->increment('total_matching_bonus', $totalMatching);
    }

    private function matchingPercent(int $generation): float
    {
        return match (true) {
            $generation === 1 => 15,
            $generation <= 4 => 15,
            $generation <= 6 => 10,
            $generation <= 10 => 5,
            default => 0,
        };
    }

    // ── Leveling Bonus ────────────────────────────────────────────────────────

    /**
     * 250k/500k/750k per pair based on package combination:
     * Silver+Silver=250k, Gold+Gold=500k, Platinum+Platinum=750k
     * Mixed pairs use the lower tier value.
     */
    private function runLevelingBonus(DailyBonusRun $run, Carbon $date): void
    {
        $profiles = MemberProfile::where('package_status', 'active')
            ->whereNotNull('left_child_id')
            ->whereNotNull('right_child_id')
            ->with(['leftChild', 'rightChild'])
            ->get();

        $totalLeveling = 0;

        foreach ($profiles as $profile) {
            $leftChild = $profile->leftChild;
            $rightChild = $profile->rightChild;

            if (! $leftChild || ! $rightChild) {
                continue;
            }

            $leftPkg = $leftChild->package_type instanceof PackageType
                ? $leftChild->package_type
                : PackageType::from($leftChild->package_type);
            $rightPkg = $rightChild->package_type instanceof PackageType
                ? $rightChild->package_type
                : PackageType::from($rightChild->package_type);

            $amount = $this->levelingBonusAmount($leftPkg, $rightPkg);

            if ($amount <= 0) {
                continue;
            }

            $ewalletAmount = (int) ($amount * 0.2);
            $cashAmount = $amount - $ewalletAmount;

            Bonus::create([
                'member_profile_id' => $profile->id,
                'bonus_type' => BonusType::Leveling->value,
                'amount' => $amount,
                'ewallet_amount' => $ewalletAmount,
                'cash_amount' => $cashAmount,
                'status' => BonusStatus::Pending->value,
                'bonus_date' => $date->toDateString(),
                'period_month' => $date->month,
                'period_year' => $date->year,
                'daily_bonus_run_id' => $run->id,
                'meta' => ['left_pkg' => $leftPkg->value, 'right_pkg' => $rightPkg->value],
            ]);

            $totalLeveling += $amount;
        }

        $run->increment('total_leveling_bonus', $totalLeveling);
    }

    private function levelingBonusAmount(PackageType $left, PackageType $right): int
    {
        $leftVal = Package::findByKey($left->value)->leveling_bonus_amount;
        $rightVal = Package::findByKey($right->value)->leveling_bonus_amount;

        return min($leftVal, $rightVal);
    }

    // ── Monthly: Repeat Order Bonus ───────────────────────────────────────────

    /**
     * 5% of RO value per G1-G7 downline who placed an RO in the given month.
     */
    public function runRepeatOrderBonus(Carbon $month): void
    {
        $periodMonth = $month->month;
        $periodYear = $month->year;

        $profiles = MemberProfile::where('package_status', 'active')->get();

        foreach ($profiles as $profile) {
            // Member harus punya personal RO minimal Rp 1.000.000 di bulan tersebut
            $ownRoTotal = RepeatOrder::where('member_profile_id', $profile->id)
                ->whereYear('created_at', $periodYear)
                ->whereMonth('created_at', $periodMonth)
                ->where('status', 'completed')
                ->sum('total_amount');

            if ($ownRoTotal < 1_000_000) {
                continue;
            }

            $downlineIds = $this->getDownlineIds($profile->id, 7);

            if (empty($downlineIds)) {
                continue;
            }

            $roTotal = RepeatOrder::whereIn('member_profile_id', $downlineIds)
                ->whereYear('created_at', $periodYear)
                ->whereMonth('created_at', $periodMonth)
                ->where('status', 'completed')
                ->sum('total_amount');

            if ($roTotal < 1_000_000) {
                continue;
            }

            $amount = (int) ($roTotal * 0.05);
            $ewalletAmount = (int) ($amount * 0.2);
            $cashAmount = $amount - $ewalletAmount;

            // Avoid duplicate for same period
            $exists = Bonus::where('member_profile_id', $profile->id)
                ->where('bonus_type', BonusType::RepeatOrder->value)
                ->where('period_month', $periodMonth)
                ->where('period_year', $periodYear)
                ->exists();

            if ($exists) {
                continue;
            }

            Bonus::create([
                'member_profile_id' => $profile->id,
                'bonus_type' => BonusType::RepeatOrder->value,
                'amount' => $amount,
                'ewallet_amount' => $ewalletAmount,
                'cash_amount' => $cashAmount,
                'status' => BonusStatus::Pending->value,
                'bonus_date' => $month->endOfMonth()->toDateString(),
                'period_month' => $periodMonth,
                'period_year' => $periodYear,
                'meta' => ['ro_total' => $roTotal, 'downline_count' => count($downlineIds)],
            ]);
        }
    }

    // ── Monthly: Global Sharing Bonus ─────────────────────────────────────────

    /**
     * % of national RO pool based on career level.
     * Distributed equally among members of the same level.
     */
    public function runGlobalSharingBonus(Carbon $month): void
    {
        $periodMonth = $month->month;
        $periodYear = $month->year;

        $nationalRoTotal = RepeatOrder::whereYear('created_at', $periodYear)
            ->whereMonth('created_at', $periodMonth)
            ->where('status', 'completed')
            ->sum('total_amount');

        if ($nationalRoTotal < 1_000_000) {
            return;
        }

        $levels = CareerLevel::cases();

        foreach ($levels as $level) {
            if ($level->globalSharePercent() <= 0) {
                continue;
            }

            $members = MemberProfile::where('career_level', $level->value)
                ->where('package_status', 'active')
                ->get();

            if ($members->isEmpty()) {
                continue;
            }

            $poolForLevel = (int) ($nationalRoTotal * $level->globalSharePercent() / 100);
            $perMember = (int) ($poolForLevel / $members->count());

            if ($perMember <= 0) {
                continue;
            }

            foreach ($members as $profile) {
                // Member harus punya personal RO minimal Rp 1.000.000 di bulan tersebut
                $ownRoTotal = RepeatOrder::where('member_profile_id', $profile->id)
                    ->whereYear('created_at', $periodYear)
                    ->whereMonth('created_at', $periodMonth)
                    ->where('status', 'completed')
                    ->sum('total_amount');

                if ($ownRoTotal < 1_000_000) {
                    continue;
                }

                $exists = Bonus::where('member_profile_id', $profile->id)
                    ->where('bonus_type', BonusType::GlobalSharing->value)
                    ->where('period_month', $periodMonth)
                    ->where('period_year', $periodYear)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $ewalletAmount = (int) ($perMember * 0.2);
                $cashAmount = $perMember - $ewalletAmount;

                Bonus::create([
                    'member_profile_id' => $profile->id,
                    'bonus_type' => BonusType::GlobalSharing->value,
                    'amount' => $perMember,
                    'ewallet_amount' => $ewalletAmount,
                    'cash_amount' => $cashAmount,
                    'status' => BonusStatus::Pending->value,
                    'bonus_date' => $month->endOfMonth()->toDateString(),
                    'period_month' => $periodMonth,
                    'period_year' => $periodYear,
                    'meta' => [
                        'career_level' => $level->value,
                        'national_ro_total' => $nationalRoTotal,
                        'pool_for_level' => $poolForLevel,
                        'members_in_level' => $members->count(),
                    ],
                ]);
            }
        }
    }

    // ── Auto Career Level Upgrade ─────────────────────────────────────────────

    /**
     * Check all active members and upgrade career level if PP threshold is met.
     */
    public function autoUpgradeCareerLevels(): void
    {
        $profiles = MemberProfile::where('package_status', 'active')->get();

        foreach ($profiles as $profile) {
            $smallerLeg = min((int) $profile->left_pp_total, (int) $profile->right_pp_total);

            $currentLevel = $profile->career_level instanceof CareerLevel
                ? $profile->career_level
                : CareerLevel::from($profile->career_level);

            // Find the highest level this member qualifies for
            $newLevel = $currentLevel;
            foreach (CareerLevel::cases() as $level) {
                if (
                    $level->sortOrder() > $currentLevel->sortOrder()
                    && $smallerLeg >= $level->requiredPp()
                    && $level->sortOrder() > $newLevel->sortOrder()
                ) {
                    $newLevel = $level;
                }
            }

            if ($newLevel !== $currentLevel) {
                $profile->update(['career_level' => $newLevel->value]);
                Log::info("Career level upgraded: profile #{$profile->id} {$currentLevel->value} → {$newLevel->value}");
            }
        }
    }

    // ── Reward Trigger ────────────────────────────────────────────────────────

    /**
     * Check all active members against reward milestones and create MemberReward records.
     */
    public function triggerRewards(): void
    {
        $milestones = RewardMilestone::orderBy('sort_order')->get();
        $profiles = MemberProfile::where('package_status', 'active')->get();

        foreach ($profiles as $profile) {
            foreach ($milestones as $milestone) {
                $qualifies = $profile->left_rp_total >= $milestone->required_left_rp
                    && $profile->right_rp_total >= $milestone->required_right_rp;

                if (! $qualifies) {
                    continue;
                }

                // Check if already awarded
                $alreadyAwarded = MemberReward::where('member_profile_id', $profile->id)
                    ->where('reward_milestone_id', $milestone->id)
                    ->exists();

                if ($alreadyAwarded) {
                    continue;
                }

                MemberReward::create([
                    'member_profile_id' => $profile->id,
                    'reward_milestone_id' => $milestone->id,
                    'status' => 'pending',
                    'qualified_at' => now(),
                ]);

                Log::info("Reward triggered: profile #{$profile->id} qualified for {$milestone->name}");
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Get IDs of all downline profiles up to N generations deep using recursive CTE.
     */
    private function getDownlineIds(int $profileId, int $maxGenerations): array
    {
        $results = DB::select(<<<'SQL'
            WITH RECURSIVE downline AS (
                SELECT id, parent_id, 1 AS generation
                FROM member_profiles
                WHERE parent_id = ?
                UNION ALL
                SELECT mp.id, mp.parent_id, d.generation + 1
                FROM member_profiles mp
                INNER JOIN downline d ON mp.parent_id = d.id
                WHERE d.generation < ?
            )
            SELECT id FROM downline
        SQL, [$profileId, $maxGenerations]);

        return array_column($results, 'id');
    }
}
