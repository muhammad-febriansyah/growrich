<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\BonusType;
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

    public function bonuses(Request $request)
    {
        $profile = auth()->user()->memberProfile;

        $dailyTypes = [
            BonusType::Sponsor->value,
            BonusType::PassUpSponsor->value,
            BonusType::Pairing->value,
            BonusType::Matching->value,
            BonusType::Leveling->value,
        ];

        $monthlyTypes = [
            BonusType::RepeatOrder->value,
            BonusType::GlobalSharing->value,
        ];

        if (! $profile) {
            return Inertia::render('member/financial/bonuses', [
                'dailyBonuses' => [],
                'monthlyBonuses' => [],
                'dailyTotal' => 0,
                'monthlyTotal' => 0,
                'dailyFilteredTotal' => null,
                'monthlyFilteredTotal' => null,
                'filters' => [],
            ]);
        }

        $dailyQuery = Bonus::where('member_profile_id', $profile->id)
            ->whereIn('bonus_type', $dailyTypes);

        if ($request->tanggal) {
            $dailyQuery->whereDate('bonus_date', $request->tanggal);
        }

        $dailyBonuses = $dailyQuery->orderBy('bonus_date', 'desc')
            ->paginate(15, ['*'], 'daily_page')
            ->withQueryString();

        $monthlyQuery = Bonus::where('member_profile_id', $profile->id)
            ->whereIn('bonus_type', $monthlyTypes);

        if ($request->bulan) {
            [$year, $month] = explode('-', $request->bulan);
            $monthlyQuery->where('period_year', $year)->where('period_month', (int) $month);
        }

        $monthlyBonuses = $monthlyQuery->orderByDesc('period_year')->orderByDesc('period_month')
            ->paginate(15, ['*'], 'monthly_page')
            ->withQueryString();

        $dailyTotal = Bonus::where('member_profile_id', $profile->id)
            ->whereIn('bonus_type', $dailyTypes)
            ->sum('amount');

        $monthlyTotal = Bonus::where('member_profile_id', $profile->id)
            ->whereIn('bonus_type', $monthlyTypes)
            ->where('period_year', now()->year)
            ->where('period_month', now()->month)
            ->sum('amount');

        $dailyFilteredTotal = $request->tanggal
            ? (int) Bonus::where('member_profile_id', $profile->id)
                ->whereIn('bonus_type', $dailyTypes)
                ->whereDate('bonus_date', $request->tanggal)
                ->sum('amount')
            : null;

        $monthlyFilteredTotal = null;
        if ($request->bulan) {
            [$yearF, $monthF] = explode('-', $request->bulan);
            $monthlyFilteredTotal = (int) Bonus::where('member_profile_id', $profile->id)
                ->whereIn('bonus_type', $monthlyTypes)
                ->where('period_year', $yearF)
                ->where('period_month', (int) $monthF)
                ->sum('amount');
        }

        return Inertia::render('member/financial/bonuses', [
            'dailyBonuses' => $dailyBonuses,
            'monthlyBonuses' => $monthlyBonuses,
            'dailyTotal' => (int) $dailyTotal,
            'monthlyTotal' => (int) $monthlyTotal,
            'dailyFilteredTotal' => $dailyFilteredTotal,
            'monthlyFilteredTotal' => $monthlyFilteredTotal,
            'filters' => $request->only(['tanggal', 'bulan']),
        ]);
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:50000',
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $user = auth()->user();
        $balance = $user->wallet->balance;
        $minimumHold = 1_000_000;

        if ($balance < $minimumHold) {
            return back()->with('error', 'Saldo e-wallet Anda kurang dari Rp 1.000.000. Minimum saldo Rp 1.000.000 harus dipertahankan untuk Auto RO bulanan.');
        }

        $maxWithdraw = $balance - $minimumHold;

        if ($request->amount > $maxWithdraw) {
            return back()->with('error', 'Maksimal penarikan adalah Rp '.number_format($maxWithdraw, 0, ',', '.').' (saldo harus tersisa minimal Rp 1.000.000).');
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
