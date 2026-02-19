<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberReward;
use App\Models\RewardMilestone;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return redirect()->route('dashboard')->with('error', 'Profil member tidak ditemukan.');
        }

        $milestones = RewardMilestone::orderBy('sort_order')->get();

        $myRewards = MemberReward::where('member_profile_id', $profile->id)
            ->with('milestone')
            ->get()
            ->keyBy('reward_milestone_id');

        $rewardProgress = $milestones->map(function (RewardMilestone $milestone) use ($profile, $myRewards) {
            $leftRp = (int) $profile->left_rp_total;
            $rightRp = (int) $profile->right_rp_total;
            $reward = $myRewards->get($milestone->id);

            return [
                'id' => $milestone->id,
                'name' => $milestone->name,
                'rewardType' => $milestone->reward_type,
                'cashValue' => (int) $milestone->cash_value,
                'requiredLeftRp' => (int) $milestone->required_left_rp,
                'requiredRightRp' => (int) $milestone->required_right_rp,
                'currentLeftRp' => $leftRp,
                'currentRightRp' => $rightRp,
                'leftProgress' => $milestone->required_left_rp > 0
                    ? min(100, (int) ($leftRp / $milestone->required_left_rp * 100))
                    : 100,
                'rightProgress' => $milestone->required_right_rp > 0
                    ? min(100, (int) ($rightRp / $milestone->required_right_rp * 100))
                    : 100,
                'qualified' => $leftRp >= $milestone->required_left_rp
                    && $rightRp >= $milestone->required_right_rp,
                'status' => $reward?->status ?? null,
                'qualifiedAt' => $reward?->qualified_at?->toDateString(),
                'fulfilledAt' => $reward?->fulfilled_at?->toDateString(),
            ];
        });

        return Inertia::render('member/rewards/index', [
            'rewardProgress' => $rewardProgress,
            'leftRp' => (int) $profile->left_rp_total,
            'rightRp' => (int) $profile->right_rp_total,
        ]);
    }
}
