<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyBonusRun;
use App\Services\BonusRunnerService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyBonusRunController extends Controller
{
    public function index(Request $request)
    {
        $runs = DailyBonusRun::orderByDesc('run_date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/daily-runs/index', [
            'runs' => $runs,
        ]);
    }

    public function show(DailyBonusRun $dailyBonusRun)
    {
        $bonuses = $dailyBonusRun->bonuses()
            ->with('memberProfile.user')
            ->orderBy('bonus_type')
            ->get();

        return Inertia::render('admin/daily-runs/show', [
            'run' => $dailyBonusRun,
            'bonuses' => $bonuses,
        ]);
    }

    public function trigger(Request $request, BonusRunnerService $service)
    {
        $request->validate([
            'date' => 'required|date|date_format:Y-m-d',
        ]);

        $date = Carbon::parse($request->date);

        // Check if already completed
        $existing = DailyBonusRun::where('run_date', $date->toDateString())
            ->where('status', 'completed')
            ->first();

        if ($existing) {
            return back()->with('error', "Daily bonus run untuk {$date->toDateString()} sudah selesai dijalankan (Run #{$existing->id}).");
        }

        try {
            $run = $service->runDaily($date);

            return back()->with('success', "Daily bonus run berhasil! Run #{$run->id} — Total Pairing: Rp ".number_format($run->total_pairing_bonus, 0, ',', '.'));
        } catch (\Throwable $e) {
            return back()->with('error', "Gagal menjalankan bonus run: {$e->getMessage()}");
        }
    }

    public function triggerMonthly(Request $request, BonusRunnerService $service)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
        ]);

        try {
            $period = Carbon::createFromDate($request->year, $request->month, 1);
            $service->runRepeatOrderBonus($period);
            $service->runGlobalSharingBonus($period);

            return back()->with('success', "Monthly bonus (RO + Global Sharing) untuk {$period->format('F Y')} berhasil dijalankan.");
        } catch (\Throwable $e) {
            return back()->with('error', "Gagal: {$e->getMessage()}");
        }
    }
}
