<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Http\Controllers\Controller;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\Package;
use App\Models\RepeatOrder;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class BonusSimulationController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile || $profile->package_status !== 'active') {
            return Inertia::render('member/financial/bonus-simulation', [
                'simulation' => null,
                'message' => 'Akun Anda belum aktif. Simulasi bonus hanya tersedia untuk member aktif.',
            ]);
        }

        $packageType = $profile->package_type instanceof PackageType
            ? $profile->package_type
            : PackageType::from($profile->package_type);

        $pairingUnit = PackageType::pairingBonusAmount();
        $maxPairs = $packageType->maxPairingPerDay();
        $leftPp = (int) $profile->left_pp_total;
        $rightPp = (int) $profile->right_pp_total;

        return Inertia::render('member/financial/bonus-simulation', [
            'simulation' => [
                'pairing' => $this->simulatePairing($profile, $leftPp, $rightPp, $maxPairs, $pairingUnit),
                'matching' => $this->simulateMatchingReceived($profile, $pairingUnit),
                'leveling' => $this->simulateLeveling($profile),
                'monthly' => $this->simulateMonthly($profile),
                'career' => $this->careerLevelProgress($profile),
                'package_type' => $packageType->value,
                'left_pp' => $leftPp,
                'right_pp' => $rightPp,
                'pairing_unit' => $pairingUnit,
                'max_pairs_per_day' => $maxPairs,
            ],
            'message' => null,
        ]);
    }

    /** @return array{pairs: int, amount: int, cash: int, ewallet: int, hangus: bool, left_pp: int, right_pp: int, cap_reached: bool} */
    private function simulatePairing(MemberProfile $profile, int $leftPp, int $rightPp, int $maxPairs, int $pairingUnit): array
    {
        if ($leftPp <= 0 || $rightPp <= 0) {
            return ['pairs' => 0, 'amount' => 0, 'cash' => 0, 'ewallet' => 0, 'hangus' => false, 'left_pp' => $leftPp, 'right_pp' => $rightPp, 'cap_reached' => false];
        }

        $alreadyPairedToday = $pairingUnit > 0
            ? (int) round(
                Bonus::where('member_profile_id', $profile->id)
                    ->where('bonus_type', BonusType::Pairing->value)
                    ->whereDate('bonus_date', now()->toDateString())
                    ->sum('amount') / $pairingUnit
            )
            : 0;

        $remainingCap = $maxPairs - $alreadyPairedToday;

        if ($remainingCap <= 0) {
            return ['pairs' => 0, 'amount' => 0, 'cash' => 0, 'ewallet' => 0, 'hangus' => false, 'left_pp' => $leftPp, 'right_pp' => $rightPp, 'cap_reached' => true];
        }

        $bothExceedMax = $leftPp >= $maxPairs && $rightPp >= $maxPairs;
        $pairs = $bothExceedMax ? $remainingCap : min($leftPp, $rightPp, $remainingCap);

        $amount = $pairs * $pairingUnit;
        $ewallet = (int) ($amount * 0.2);
        $cash = $amount - $ewallet;

        return [
            'pairs' => $pairs,
            'amount' => $amount,
            'cash' => $cash,
            'ewallet' => $ewallet,
            'hangus' => $bothExceedMax,
            'left_pp' => $leftPp,
            'right_pp' => $rightPp,
            'cap_reached' => false,
        ];
    }

    /** @return array{total: int, details: list<array{generation: int, percent: float, estimated_amount: int, sources: int}>} */
    private function simulateMatchingReceived(MemberProfile $profile, int $pairingUnit): array
    {
        $details = [];
        $total = 0;
        $this->collectMatchingEstimate($profile, $pairingUnit, $details, $total);

        return ['total' => $total, 'details' => array_values($details)];
    }

    private function collectMatchingEstimate(MemberProfile $profile, int $pairingUnit, array &$details, int &$total, int $depth = 1): void
    {
        if ($depth > 10) {
            return;
        }

        $directChildren = User::where('sponsor_id', $profile->user_id)->with('memberProfile')->get();

        foreach ($directChildren as $child) {
            $childProfile = $child->memberProfile;
            if (! $childProfile || $childProfile->package_status !== 'active') {
                continue;
            }

            $childPairingToday = (int) Bonus::where('member_profile_id', $childProfile->id)
                ->where('bonus_type', BonusType::Pairing->value)
                ->whereDate('bonus_date', now()->toDateString())
                ->sum('amount');

            if ($childPairingToday > 0) {
                $percent = $this->matchingPercent($depth);
                $matchingAmount = (int) ($childPairingToday * $percent / 100);

                if ($matchingAmount > 0) {
                    if (! isset($details[$depth])) {
                        $details[$depth] = ['generation' => $depth, 'percent' => $percent, 'estimated_amount' => 0, 'sources' => 0];
                    }
                    $details[$depth]['estimated_amount'] += $matchingAmount;
                    $details[$depth]['sources'] += 1;
                    $total += $matchingAmount;
                }
            }

            $this->collectMatchingEstimate($childProfile, $pairingUnit, $details, $total, $depth + 1);
        }
    }

    /** @return array{total: int, pending_levels: int[], already_rewarded: int[], details: list<array{level: int, amount: int, cash: int, ewallet: int, left_pkg: string, right_pkg: string}>} */
    private function simulateLeveling(MemberProfile $profile): array
    {
        $rewardedLevels = $profile->leveling_rewarded_levels ?? [];
        $pendingLevels = [];
        $details = [];
        $total = 0;

        for ($level = 1; $level <= 6; $level++) {
            if (in_array($level, $rewardedLevels)) {
                continue;
            }

            $leftMembers = $this->getMembersAtDepth($profile, 'left', $level);
            $rightMembers = $this->getMembersAtDepth($profile, 'right', $level);

            if ($leftMembers->isEmpty() || $rightMembers->isEmpty()) {
                $pendingLevels[] = $level;

                continue;
            }

            $leftMember = $leftMembers->sortBy('created_at')->first();
            $rightMember = $rightMembers->sortBy('created_at')->first();

            $leftPkg = $leftMember->package_type instanceof PackageType
                ? $leftMember->package_type
                : PackageType::from($leftMember->package_type->value ?? $leftMember->package_type);

            $rightPkg = $rightMember->package_type instanceof PackageType
                ? $rightMember->package_type
                : PackageType::from($rightMember->package_type->value ?? $rightMember->package_type);

            $amount = min(
                Package::findByKey($leftPkg->value)->leveling_bonus_amount,
                Package::findByKey($rightPkg->value)->leveling_bonus_amount
            );

            if ($amount > 0) {
                $ewallet = (int) ($amount * 0.2);
                $details[] = ['level' => $level, 'amount' => $amount, 'cash' => $amount - $ewallet, 'ewallet' => $ewallet, 'left_pkg' => $leftPkg->value, 'right_pkg' => $rightPkg->value];
                $total += $amount;
            }
        }

        return ['total' => $total, 'pending_levels' => $pendingLevels, 'already_rewarded' => $rewardedLevels, 'details' => $details];
    }

    /** @return array{repeat_order: array{amount: int, percent: float, own_ro: int, downline_ro: int}, global_sharing: array{amount: int|null, pool: int, percent: float, qualified: bool, level: string, members_at_level: int, national_ro: int}} */
    private function simulateMonthly(MemberProfile $profile): array
    {
        $month = now()->month;
        $year = now()->year;

        $ownRo = (int) RepeatOrder::where('member_profile_id', $profile->id)
            ->where('status', 'completed')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->sum('total_amount');

        $roDownlineTotal = $this->getDownlineRoTotal($profile, $year, $month, 7);
        $roBonus = (int) ($roDownlineTotal * 0.05);

        $careerLevel = $profile->career_level instanceof CareerLevel
            ? $profile->career_level
            : CareerLevel::from($profile->career_level ?? CareerLevel::Member->value);

        $globalSharePercent = $careerLevel->globalSharePercent();
        $qualified = $ownRo >= 1_000_000;

        $nationalRoTotal = (int) RepeatOrder::where('status', 'completed')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->sum('total_amount');

        $membersAtLevel = $globalSharePercent > 0
            ? MemberProfile::where('career_level', $careerLevel->value)->where('package_status', 'active')->count()
            : 0;

        $globalPool = $globalSharePercent > 0 ? (int) ($nationalRoTotal * $globalSharePercent / 100) : 0;
        $globalPerMember = ($qualified && $membersAtLevel > 0) ? (int) ($globalPool / $membersAtLevel) : null;

        return [
            'repeat_order' => ['amount' => $roBonus, 'percent' => 5.0, 'own_ro' => $ownRo, 'downline_ro' => $roDownlineTotal],
            'global_sharing' => ['amount' => $globalPerMember, 'pool' => $globalPool, 'percent' => $globalSharePercent, 'qualified' => $qualified, 'level' => $careerLevel->label(), 'members_at_level' => $membersAtLevel, 'national_ro' => $nationalRoTotal],
        ];
    }

    /** @return array{current_level: string, next_level: string|null, smaller_leg_cumulative: int, left_cumulative: int, right_cumulative: int, current_required: int, next_required: int, progress_percent: float} */
    private function careerLevelProgress(MemberProfile $profile): array
    {
        $careerLevel = $profile->career_level instanceof CareerLevel
            ? $profile->career_level
            : CareerLevel::from($profile->career_level ?? CareerLevel::Member->value);

        $smallerLeg = min((int) $profile->left_pp_cumulative, (int) $profile->right_pp_cumulative);

        $nextLevel = null;
        $nextRequired = 0;

        foreach (CareerLevel::cases() as $level) {
            if ($level->sortOrder() > $careerLevel->sortOrder()) {
                $nextLevel = $level->label();
                $nextRequired = $level->requiredPp();
                break;
            }
        }

        $currentRequired = $careerLevel->requiredPp();
        $progressPercent = ($nextRequired > $currentRequired)
            ? min(100.0, round(($smallerLeg - $currentRequired) / ($nextRequired - $currentRequired) * 100, 1))
            : 100.0;

        return [
            'current_level' => $careerLevel->label(),
            'next_level' => $nextLevel,
            'smaller_leg_cumulative' => $smallerLeg,
            'left_cumulative' => (int) $profile->left_pp_cumulative,
            'right_cumulative' => (int) $profile->right_pp_cumulative,
            'current_required' => $currentRequired,
            'next_required' => $nextRequired,
            'progress_percent' => $progressPercent,
        ];
    }

    private function getDownlineRoTotal(MemberProfile $profile, int $year, int $month, int $maxGen): int
    {
        $total = 0;
        $currentUserIds = [$profile->user_id];

        for ($gen = 1; $gen <= $maxGen; $gen++) {
            $nextUserIds = User::whereIn('sponsor_id', $currentUserIds)->pluck('id')->toArray();
            if (empty($nextUserIds)) {
                break;
            }

            $profileIds = MemberProfile::whereIn('user_id', $nextUserIds)->pluck('id');
            $total += (int) RepeatOrder::whereIn('member_profile_id', $profileIds)
                ->where('status', 'completed')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('total_amount');

            $currentUserIds = $nextUserIds;
        }

        return $total;
    }

    private function matchingPercent(int $generation): float
    {
        return match (true) {
            $generation <= 4 => 15,
            $generation <= 6 => 10,
            $generation <= 10 => 5,
            default => 0,
        };
    }

    /** @return \Illuminate\Support\Collection<int, MemberProfile> */
    private function getMembersAtDepth(MemberProfile $root, string $leg, int $depth): \Illuminate\Support\Collection
    {
        $startChildId = $leg === 'left' ? $root->left_child_id : $root->right_child_id;

        if (! $startChildId) {
            return collect();
        }

        $currentLevel = MemberProfile::where('id', $startChildId)->get();

        for ($d = 1; $d < $depth; $d++) {
            $childIds = [];
            foreach ($currentLevel as $member) {
                if ($member->left_child_id) {
                    $childIds[] = $member->left_child_id;
                }
                if ($member->right_child_id) {
                    $childIds[] = $member->right_child_id;
                }
            }
            if (empty($childIds)) {
                return collect();
            }
            $currentLevel = MemberProfile::whereIn('id', $childIds)->get();
        }

        return $currentLevel;
    }
}
