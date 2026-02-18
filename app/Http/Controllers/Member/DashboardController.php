<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\CareerLevel;
use App\Http\Controllers\Controller;
use App\Models\RewardMilestone;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        // Member belum memiliki profil (akun lama / belum aktivasi)
        if (! $profile) {
            return Inertia::render('dashboard', [
                'stats' => [
                    'walletBalance' => 0,
                    'totalBonusThisMonth' => 0,
                    'totalDownline' => 0,
                    'leftPp' => 0,
                    'rightPp' => 0,
                    'leftRp' => 0,
                    'rightRp' => 0,
                    'careerLevel' => CareerLevel::Member->label(),
                    'packageType' => '-',
                    'nextLevelLabel' => CareerLevel::CoreLoader->label(),
                    'nextLevelPp' => CareerLevel::CoreLoader->requiredPp(),
                ],
                'recentBonuses' => [],
                'rewardProgress' => null,
            ]);
        }

        // ── Stats ─────────────────────────────────────────────────────────────
        $walletBalance = $user->wallet?->balance ?? 0;

        $now = now();
        $totalBonusThisMonth = $profile->bonuses()
            ->whereIn('status', [BonusStatus::Approved->value, BonusStatus::Paid->value])
            ->whereYear('bonus_date', $now->year)
            ->whereMonth('bonus_date', $now->month)
            ->sum('amount');

        $totalDownline = $this->countDownline($profile->id);

        // ── Career level progression ───────────────────────────────────────────
        $currentLevel = $profile->career_level instanceof CareerLevel
            ? $profile->career_level
            : CareerLevel::from($profile->career_level);

        $nextLevel = $this->nextCareerLevel($currentLevel);

        // ── Recent bonuses ────────────────────────────────────────────────────
        $recentBonuses = $profile->bonuses()
            ->orderByDesc('bonus_date')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'bonus_type', 'amount', 'status', 'bonus_date'])
            ->map(fn ($b) => [
                'id' => $b->id,
                'type' => $b->bonus_type instanceof \BackedEnum ? $b->bonus_type->value : $b->bonus_type,
                'amount' => (int) $b->amount,
                'status' => $b->status instanceof \BackedEnum ? $b->status->value : $b->status,
                'date' => \Carbon\Carbon::parse($b->bonus_date)->translatedFormat('d M Y'),
            ]);

        // ── Next reward milestone ─────────────────────────────────────────────
        $rewardProgress = RewardMilestone::query()
            ->where(function ($q) use ($profile) {
                $q->where('required_left_rp', '>', $profile->left_rp_total)
                    ->orWhere('required_right_rp', '>', $profile->right_rp_total);
            })
            ->orderBy('sort_order')
            ->first();

        return Inertia::render('dashboard', [
            'stats' => [
                'walletBalance' => (int) $walletBalance,
                'totalBonusThisMonth' => (int) $totalBonusThisMonth,
                'totalDownline' => $totalDownline,
                'leftPp' => (int) $profile->left_pp_total,
                'rightPp' => (int) $profile->right_pp_total,
                'leftRp' => (int) $profile->left_rp_total,
                'rightRp' => (int) $profile->right_rp_total,
                'careerLevel' => $currentLevel->label(),
                'packageType' => $profile->package_type instanceof \BackedEnum
                    ? $profile->package_type->value
                    : $profile->package_type,
                'nextLevelLabel' => $nextLevel?->label(),
                'nextLevelPp' => $nextLevel?->requiredPp() ?? 0,
            ],
            'recentBonuses' => $recentBonuses,
            'rewardProgress' => $rewardProgress ? [
                'name' => $rewardProgress->name,
                'requiredLeftRp' => (int) $rewardProgress->required_left_rp,
                'requiredRightRp' => (int) $rewardProgress->required_right_rp,
                'currentLeftRp' => (int) $profile->left_rp_total,
                'currentRightRp' => (int) $profile->right_rp_total,
            ] : null,
        ]);
    }

    /** Count all descendants in the binary tree using a recursive CTE. */
    private function countDownline(int $profileId): int
    {
        $result = DB::select(<<<'SQL'
            WITH RECURSIVE downline AS (
                SELECT id FROM member_profiles WHERE id = ?
                UNION ALL
                SELECT mp.id FROM member_profiles mp
                INNER JOIN downline d ON mp.parent_id = d.id
            )
            SELECT COUNT(*) - 1 AS total FROM downline
        SQL, [$profileId]);

        return (int) ($result[0]->total ?? 0);
    }

    /** Return the next career level above the given one, or null if at the top. */
    private function nextCareerLevel(CareerLevel $current): ?CareerLevel
    {
        $levels = CareerLevel::cases();
        $currentOrder = $current->sortOrder();

        foreach ($levels as $level) {
            if ($level->sortOrder() === $currentOrder + 1) {
                return $level;
            }
        }

        return null;
    }
}
