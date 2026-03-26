<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\BonusStatus;
use App\Http\Controllers\Controller;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\RegistrationPin;
use App\Models\RepeatOrder;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_members' => User::where('role', 'member')->count(),
            'active_members' => MemberProfile::where('package_status', 'active')->count(),
            'new_members_this_month' => User::where('role', 'member')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'pending_bonuses' => Bonus::where('status', BonusStatus::Pending)->count(),
            'approved_bonuses' => Bonus::where('status', BonusStatus::Approved)->count(),
            'total_bonus_paid_cash' => Bonus::where('status', BonusStatus::Paid)->sum('cash_amount'),
            'total_bonus_approved_ewallet' => Bonus::where('status', BonusStatus::Approved)->sum('ewallet_amount'),
            'pending_withdrawals' => Withdrawal::where('status', 'pending')->count(),
            'pending_withdrawal_amount' => Withdrawal::where('status', 'pending')->sum('amount'),
            'available_pins' => RegistrationPin::where('status', 'available')->count(),
            'total_ro' => RepeatOrder::count(),
        ];

        $bonusByType = Bonus::whereNotIn('status', [BonusStatus::Rejected])
            ->select(
                'bonus_type',
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('SUM(CASE WHEN status = "Paid" THEN cash_amount ELSE 0 END) as paid_cash'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(CASE WHEN status = "Pending" THEN 1 ELSE 0 END) as pending_count'),
                DB::raw('SUM(CASE WHEN status = "Approved" THEN 1 ELSE 0 END) as approved_count'),
                DB::raw('SUM(CASE WHEN status = "Paid" THEN 1 ELSE 0 END) as paid_count'),
            )
            ->groupBy('bonus_type')
            ->orderByDesc('total_amount')
            ->get()
            ->map(fn ($b) => [
                'type' => $b->bonus_type instanceof \BackedEnum ? $b->bonus_type->value : $b->bonus_type,
                'total' => (int) $b->total_amount,
                'paid_cash' => (int) $b->paid_cash,
                'count' => (int) $b->count,
                'pending_count' => (int) $b->pending_count,
                'approved_count' => (int) $b->approved_count,
                'paid_count' => (int) $b->paid_count,
            ]);

        $memberGrowth = User::where('role', 'member')
            ->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"), DB::raw('COUNT(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'count' => $r->count]);

        $recentMembers = User::where('role', 'member')
            ->with('memberProfile')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'member_id' => $u->member_id ?? $u->referral_code,
                'referral_code' => $u->referral_code,
                'package_type' => $u->memberProfile?->package_type instanceof \BackedEnum
                    ? $u->memberProfile->package_type->value
                    : $u->memberProfile?->package_type,
                'joined_at' => $u->created_at->toDateString(),
            ]);

        $recentWithdrawals = Withdrawal::with('user')
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($w) => [
                'id' => $w->id,
                'amount' => $w->amount,
                'bank_name' => $w->bank_name,
                'account_number' => $w->account_number,
                'user_name' => $w->user?->name,
            ]);

        return Inertia::render('admin/dashboard', compact(
            'stats',
            'bonusByType',
            'memberGrowth',
            'recentMembers',
            'recentWithdrawals',
        ));
    }
}
