<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = Withdrawal::query()->with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $withdrawals = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Withdrawal $withdrawal)
    {
        $withdrawal->load(['user.memberProfile', 'processedBy']);

        return Inertia::render('admin/withdrawals/show', [
            'withdrawal' => $withdrawal,
        ]);
    }

    public function approve(Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Permintaan sudah diproses.');
        }

        DB::transaction(function () use ($withdrawal) {
            $withdrawal->update([
                'status' => 'approved',
                'processed_by' => auth()->id(),
            ]);

            // Deduction from wallet happened at request time (usually)
            // But if it's "manual" approval that triggers deduction:
            // $withdrawal->user->wallet->decrement('balance', $withdrawal->amount);
        });

        return back()->with('success', 'Penarikan berhasil disetujui.');
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Permintaan sudah diproses.');
        }

        DB::transaction(function () use ($withdrawal) {
            $withdrawal->update([
                'status' => 'rejected',
                'processed_by' => auth()->id(),
            ]);

            // Refund to wallet
            $withdrawal->user->wallet->increment('balance', $withdrawal->amount);
        });

        return back()->with('success', 'Penarikan berhasil ditolak dan saldo dikembalikan.');
    }
}
