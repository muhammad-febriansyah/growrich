<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberReward;
use App\Models\RewardMilestone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'memberRewardId' => $reward?->id,
                'qualifiedAt' => $reward?->qualified_at?->toDateString(),
                'fulfilledAt' => $reward?->fulfilled_at?->toDateString(),
                'claimedAt' => $reward?->claimed_at?->toDateString(),
                'shippedAt' => $reward?->shipped_at?->toDateString(),
                'courier' => $reward?->courier,
                'trackingNumber' => $reward?->tracking_number,
                'shippingNotes' => $reward?->shipping_notes,
                'recipientName' => $reward?->recipient_name,
                'recipientPhone' => $reward?->recipient_phone,
                'recipientAddress' => $reward?->recipient_address,
            ];
        });

        return Inertia::render('member/rewards/index', [
            'rewardProgress' => $rewardProgress,
            'leftRp' => (int) $profile->left_rp_total,
            'rightRp' => (int) $profile->right_rp_total,
        ]);
    }

    public function claim(Request $request, MemberReward $memberReward): RedirectResponse
    {
        $user = auth()->user();

        if ($memberReward->memberProfile->user_id !== $user->id) {
            abort(403);
        }

        if ($memberReward->status !== 'pending') {
            return back()->with('error', 'Reward ini tidak dapat diklaim.');
        }

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'recipient_address' => 'required|string|max:1000',
        ], [
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'recipient_phone.required' => 'Nomor telepon wajib diisi.',
            'recipient_address.required' => 'Alamat pengiriman wajib diisi.',
        ]);

        $memberReward->update(array_merge($validated, [
            'status' => 'claimed',
            'claimed_at' => now(),
        ]));

        return back()->with('success', 'Klaim reward berhasil dikirim. Admin akan memproses pengiriman segera.');
    }
}
