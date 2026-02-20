<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Jobs\SendWithdrawalSubmittedEmail;
use App\Models\Bonus;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinancialController extends Controller
{
    public function wallet()
    {
        $user = auth()->user()->load('wallet.transactions');
        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'wd_page');

        return Inertia::render('member/financial/wallet', [
            'wallet' => $user->wallet,
            'withdrawals' => $withdrawals,
        ]);
    }

    public function bonuses()
    {
        $profile = auth()->user()->memberProfile;

        $bonuses = $profile
            ? Bonus::where('member_profile_id', $profile->id)
                ->orderBy('created_at', 'desc')
                ->paginate(15)
            : Bonus::where('member_profile_id', 0)->paginate(15);

        return Inertia::render('member/financial/bonuses', [
            'bonuses' => $bonuses,
        ]);
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:50000', // Minimal WD 50rb
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $user = auth()->user();
        if ($user->wallet->balance < $request->amount) {
            return back()->with('error', 'Saldo tidak mencukupi.');
        }

        $withdrawal = null;

        DB::transaction(function () use ($user, $request, &$withdrawal) {
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'status' => 'pending',
            ]);

            $user->wallet->decrement('balance', $request->amount);
        });

        SendWithdrawalSubmittedEmail::dispatch($withdrawal->load('user'));

        return back()->with('success', 'Permintaan penarikan berhasil dikirim.');
    }
}
