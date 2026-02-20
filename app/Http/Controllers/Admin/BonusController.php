<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\BonusStatus;
use App\Http\Controllers\Controller;
use App\Models\Bonus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BonusController extends Controller
{
    public function index(Request $request)
    {
        $query = Bonus::query()->with('memberProfile.user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('bonus_type', $request->type);
        }

        if ($request->filled('search')) {
            $query->whereHas('memberProfile.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $bonuses = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'pending' => Bonus::where('status', BonusStatus::Pending)->count(),
            'approved' => Bonus::where('status', BonusStatus::Approved)->count(),
            'rejected' => Bonus::where('status', BonusStatus::Rejected)->count(),
            'total_amount' => Bonus::where('status', BonusStatus::Approved)->sum('amount'),
        ];

        return Inertia::render('admin/bonuses/index', [
            'bonuses' => $bonuses,
            'filters' => $request->only(['status', 'type', 'search']),
            'stats' => $stats,
        ]);
    }

    public function show(Bonus $bonus): Response
    {
        $bonus->load([
            'memberProfile.user',
            'memberProfile.parent.user',
            'approvedBy',
            'dailyBonusRun',
        ]);

        return Inertia::render('admin/bonuses/show', [
            'bonus' => $bonus,
        ]);
    }

    public function approve(Bonus $bonus)
    {
        if ($bonus->status !== BonusStatus::Pending) {
            return back()->with('error', 'Hanya bonus berstatus Pending yang dapat disetujui.');
        }

        DB::transaction(function () use ($bonus) {
            $bonus->update([
                'status' => BonusStatus::Approved,
                'approved_by' => auth()->id(),
            ]);

            $wallet = $bonus->memberProfile->user->wallet;
            $wallet->credit(
                $bonus->ewallet_amount,
                'Bonus '.$bonus->bonus_type->value.' disetujui',
                Bonus::class,
                $bonus->id,
            );
        });

        return back()->with('success', 'Bonus berhasil disetujui dan saldo member telah diperbarui.');
    }

    public function reject(Bonus $bonus)
    {
        if ($bonus->status !== BonusStatus::Pending) {
            return back()->with('error', 'Hanya bonus berstatus Pending yang dapat ditolak.');
        }

        $bonus->update([
            'status' => BonusStatus::Rejected,
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Bonus berhasil ditolak.');
    }
}
