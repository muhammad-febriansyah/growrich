<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MemberReward;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRewardController extends Controller
{
    public function index(Request $request): \Inertia\Response
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

    public function ship(Request $request, MemberReward $reward): RedirectResponse
    {
        if (! in_array($reward->status, ['claimed', 'pending'])) {
            return back()->with('error', 'Reward ini tidak dapat diproses pengiriman.');
        }

        $validated = $request->validate([
            'courier' => 'required|string|max:100',
            'tracking_number' => 'required|string|max:100',
            'shipping_notes' => 'nullable|string|max:500',
        ], [
            'courier.required' => 'Nama kurir wajib diisi.',
            'tracking_number.required' => 'Nomor resi wajib diisi.',
        ]);

        $reward->update(array_merge($validated, [
            'status' => 'shipped',
            'shipped_at' => now(),
        ]));

        $reward->load('memberProfile.user', 'milestone');
        ActivityLogger::log(
            'reward.shipped',
            "Reward '{$reward->milestone->name}' member '{$reward->memberProfile->user->name}' dikirim via {$validated['courier']} resi {$validated['tracking_number']}.",
            $reward,
        );

        return back()->with('success', 'Info pengiriman berhasil disimpan.');
    }

    public function fulfill(MemberReward $reward): RedirectResponse
    {
        if (! in_array($reward->status, ['shipped', 'claimed', 'pending'])) {
            return back()->with('error', 'Reward ini tidak dapat ditandai terpenuhi.');
        }

        $reward->update([
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
        ]);

        $reward->load('memberProfile.user', 'milestone');
        ActivityLogger::log(
            'reward.fulfilled',
            "Reward '{$reward->milestone->name}' member '{$reward->memberProfile->user->name}' dipenuhi.",
            $reward,
        );

        return back()->with('success', 'Reward berhasil ditandai sebagai terpenuhi.');
    }

    public function reject(MemberReward $reward): RedirectResponse
    {
        if ($reward->status === 'fulfilled') {
            return back()->with('error', 'Reward yang sudah terpenuhi tidak dapat ditolak.');
        }

        $reward->update(['status' => 'rejected']);

        $reward->load('memberProfile.user', 'milestone');
        ActivityLogger::log(
            'reward.rejected',
            "Reward '{$reward->milestone->name}' member '{$reward->memberProfile->user->name}' ditolak.",
            $reward,
        );

        return back()->with('success', 'Reward berhasil ditolak.');
    }
}
