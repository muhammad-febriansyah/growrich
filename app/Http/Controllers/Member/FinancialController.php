<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\BonusType;
use App\Http\Controllers\Controller;
use App\Jobs\SendWithdrawalSubmittedEmail;
use App\Models\BankAccount;
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

        $bankAccounts = BankAccount::where('user_id', $user->id)
            ->orderByDesc('is_primary')
            ->orderBy('created_at')
            ->get(['id', 'bank_name', 'account_number', 'account_name', 'is_primary']);

        return Inertia::render('member/financial/wallet', [
            'wallet' => $user->wallet,
            'withdrawals' => $withdrawals,
            'bankAccounts' => $bankAccounts,
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
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'bank_name' => 'required_without:bank_account_id|string|nullable',
            'account_number' => 'required_without:bank_account_id|string|nullable',
            'account_name' => 'required_without:bank_account_id|string|nullable',
        ], [
            'bank_name.required_without' => 'Nama bank wajib diisi jika tidak memilih rekening tersimpan.',
            'account_number.required_without' => 'Nomor rekening wajib diisi.',
            'account_name.required_without' => 'Nama pemilik rekening wajib diisi.',
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

        // Resolve bank account details
        if ($request->filled('bank_account_id')) {
            $bankAccount = BankAccount::where('id', $request->bank_account_id)
                ->where('user_id', $user->id)
                ->firstOrFail();
            $bankName = $bankAccount->bank_name;
            $accountNumber = $bankAccount->account_number;
            $accountName = $bankAccount->account_name;
        } else {
            $bankName = $request->bank_name;
            $accountNumber = $request->account_number;
            $accountName = $request->account_name;
        }

        $withdrawal = null;

        DB::transaction(function () use ($user, $request, $bankName, $accountNumber, $accountName, &$withdrawal) {
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'bank_name' => $bankName,
                'account_number' => $accountNumber,
                'account_name' => $accountName,
                'status' => 'pending',
            ]);

            $user->wallet->decrement('balance', $request->amount);
        });

        SendWithdrawalSubmittedEmail::dispatch($withdrawal->load('user'));

        return back()->with('success', 'Permintaan penarikan berhasil dikirim.');
    }
}
