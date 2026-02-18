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
            'total_members'             => User::where('role', 'member')->count(),
            'active_members'            => MemberProfile::where('package_status', 'active')->count(),
            'new_members_30d'           => User::where('role', 'member')
                ->where('created_at', '>=', now()->subDays(30))
                ->count(),
            'pending_bonuses'           => Bonus::where('status', BonusStatus::Pending)->count(),
            'total_bonus_approved'      => Bonus::whereIn('status', [BonusStatus::Approved, BonusStatus::Paid])->sum('amount'),
            'pending_withdrawals'       => Withdrawal::where('status', 'pending')->count(),
            'pending_withdrawal_amount' => Withdrawal::where('status', 'pending')->sum('amount'),
            'available_pins'            => RegistrationPin::where('status', 'available')->count(),
            'total_ro'                  => RepeatOrder::count(),
        ];

        $bonusByType = Bonus::whereIn('status', [BonusStatus::Approved, BonusStatus::Paid])
            ->select('bonus_type', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('bonus_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($b) => [
                'type'  => $b->bonus_type instanceof \BackedEnum ? $b->bonus_type->value : $b->bonus_type,
                'total' => (int) $b->total,
                'count' => $b->count,
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
                'id'            => $u->id,
                'name'          => $u->name,
                'referral_code' => $u->referral_code,
                'package_type'  => $u->memberProfile?->package_type instanceof \BackedEnum
                    ? $u->memberProfile->package_type->value
                    : $u->memberProfile?->package_type,
                'joined_at'     => $u->created_at->toDateString(),
            ]);

        $recentWithdrawals = Withdrawal::with('user')
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($w) => [
                'id'             => $w->id,
                'amount'         => $w->amount,
                'bank_name'      => $w->bank_name,
                'account_number' => $w->account_number,
                'user_name'      => $w->user?->name,
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
