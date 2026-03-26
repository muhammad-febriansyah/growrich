<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\BonusStatus;
use App\Http\Controllers\Controller;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\PinOrder;
use App\Models\RepeatOrder;
use App\Models\User;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $currentYear = now()->year;
        $selectedYear = (int) $request->get('year', $currentYear);

        $earliestDate = User::where('role', 'member')->min('created_at');
        $earliestYear = $earliestDate ? (int) Carbon::parse($earliestDate)->year : $currentYear;
        $yearOptions = range($earliestYear, $currentYear);

        // ── Revenue by month ─────────────────────────────────────────────────
        $roByMonth = RepeatOrder::whereNotNull('paid_at')
            ->whereYear('paid_at', $selectedYear)
            ->get(['paid_at', 'total_amount'])
            ->groupBy(fn ($r) => (int) Carbon::parse($r->paid_at)->month)
            ->map(fn ($items) => (int) $items->sum('total_amount'));

        $pinByMonth = PinOrder::whereNotNull('paid_at')
            ->whereYear('paid_at', $selectedYear)
            ->get(['paid_at', 'total_amount'])
            ->groupBy(fn ($r) => (int) Carbon::parse($r->paid_at)->month)
            ->map(fn ($items) => (int) $items->sum('total_amount'));

        $revenueByMonth = collect(range(1, 12))->map(function ($m) use ($roByMonth, $pinByMonth) {
            $ro = $roByMonth->get($m) ?? 0;
            $pin = $pinByMonth->get($m) ?? 0;

            return [
                'month' => $m,
                'ro_amount' => $ro,
                'pin_amount' => $pin,
                'total' => $ro + $pin,
            ];
        });

        // ── Member growth by month ───────────────────────────────────────────
        $memberMonthly = User::where('role', 'member')
            ->whereYear('created_at', $selectedYear)
            ->get(['created_at'])
            ->groupBy(fn ($u) => (int) Carbon::parse($u->created_at)->month)
            ->map(fn ($items) => $items->count());

        $memberGrowthByMonth = collect(range(1, 12))->map(fn ($m) => [
            'month' => $m,
            'count' => $memberMonthly->get($m) ?? 0,
        ]);

        // ── Bonus by month ───────────────────────────────────────────────────
        $bonusRows = Bonus::whereIn('status', [BonusStatus::Approved, BonusStatus::Paid])
            ->where('period_year', $selectedYear)
            ->whereNotNull('period_month')
            ->get(['period_month', 'amount'])
            ->groupBy('period_month');

        $bonusByMonth = collect(range(1, 12))->map(fn ($m) => [
            'month' => $m,
            'total' => (int) ($bonusRows->get($m)?->sum('amount') ?? 0),
            'count' => (int) ($bonusRows->get($m)?->count() ?? 0),
        ]);

        // ── Bonus by type ────────────────────────────────────────────────────
        $bonusByType = Bonus::whereIn('status', [BonusStatus::Approved, BonusStatus::Paid])
            ->where('period_year', $selectedYear)
            ->select('bonus_type', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('bonus_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($b) => [
                'type' => $b->bonus_type instanceof \BackedEnum ? $b->bonus_type->value : $b->bonus_type,
                'total' => (int) $b->total,
                'count' => (int) $b->count,
            ]);

        // ── Withdrawal by month ──────────────────────────────────────────────
        $withdrawalMonthly = Withdrawal::where('status', 'approved')
            ->whereYear('updated_at', $selectedYear)
            ->get(['updated_at', 'amount'])
            ->groupBy(fn ($w) => (int) Carbon::parse($w->updated_at)->month)
            ->map(fn ($items) => (int) $items->sum('amount'));

        $withdrawalByMonth = collect(range(1, 12))->map(fn ($m) => [
            'month' => $m,
            'total' => $withdrawalMonthly->get($m) ?? 0,
        ]);

        // ── Network stats ────────────────────────────────────────────────────
        $networkByPackage = MemberProfile::select('package_type', DB::raw('COUNT(*) as count'))
            ->groupBy('package_type')
            ->get()
            ->map(fn ($r) => [
                'package_type' => $r->package_type instanceof \BackedEnum ? $r->package_type->value : $r->package_type,
                'count' => (int) $r->count,
            ]);

        $networkByStatus = MemberProfile::select('package_status', DB::raw('COUNT(*) as count'))
            ->groupBy('package_status')
            ->get()
            ->map(fn ($r) => [
                'status' => $r->package_status instanceof \BackedEnum ? $r->package_status->value : $r->package_status,
                'count' => (int) $r->count,
            ]);

        // ── Year summary ─────────────────────────────────────────────────────
        $summary = [
            'total_revenue' => $revenueByMonth->sum('total'),
            'total_bonus_paid' => $bonusByMonth->sum('total'),
            'total_new_members' => $memberGrowthByMonth->sum('count'),
            'total_withdrawn' => $withdrawalByMonth->sum('total'),
        ];

        return Inertia::render('admin/reports/index', compact(
            'selectedYear',
            'yearOptions',
            'revenueByMonth',
            'memberGrowthByMonth',
            'bonusByMonth',
            'bonusByType',
            'withdrawalByMonth',
            'networkByPackage',
            'networkByStatus',
            'summary',
        ));
    }
}
