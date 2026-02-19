<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberReward;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRewardController extends Controller
{
    public function index(Request $request)
    {
        $query = MemberReward::with(['memberProfile.user', 'milestone']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('memberProfile.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $rewards = $query->orderByDesc('qualified_at')->paginate(20)->withQueryString();

        $stats = [
            'pending' => MemberReward::where('status', 'pending')->count(),
            'fulfilled' => MemberReward::where('status', 'fulfilled')->count(),
            'rejected' => MemberReward::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/rewards/index', [
            'rewards' => $rewards,
            'filters' => $request->only(['status', 'search']),
            'stats' => $stats,
        ]);
    }

    public function fulfill(MemberReward $reward)
    {
        if ($reward->status !== 'pending') {
            return back()->with('error', 'Hanya reward berstatus pending yang dapat dipenuhi.');
        }

        $reward->update([
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
        ]);

        return back()->with('success', 'Reward berhasil ditandai sebagai terpenuhi.');
    }

    public function reject(MemberReward $reward)
    {
        if ($reward->status !== 'pending') {
            return back()->with('error', 'Hanya reward berstatus pending yang dapat ditolak.');
        }

        $reward->update(['status' => 'rejected']);

        return back()->with('success', 'Reward berhasil ditolak.');
    }
}
