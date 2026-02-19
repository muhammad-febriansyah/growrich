<?php

namespace App\Console\Commands;

use App\Services\BonusRunnerService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class RunMonthlyBonusCommand extends Command
{
    protected $signature = 'bonus:run-monthly {month? : Month number 1-12 (default: last month)} {year? : Year (default: current year)}';

    protected $description = 'Run monthly bonuses: Repeat Order and Global Sharing';

    public function handle(BonusRunnerService $service): int
    {
        $month = (int) ($this->argument('month') ?? now()->subMonth()->month);
        $year = (int) ($this->argument('year') ?? now()->year);

        if ($month < 1 || $month > 12) {
            $this->error("Invalid month: {$month}. Must be 1-12.");

            return self::FAILURE;
        }

        $period = Carbon::createFromDate($year, $month, 1);

        $this->info("Running monthly bonuses for {$period->format('F Y')}...");

        $service->runRepeatOrderBonus($period);
        $service->runGlobalSharingBonus($period);

        $this->info("✅ Done! Repeat Order & Global Sharing bonuses generated for {$period->format('F Y')}.");

        return self::SUCCESS;
    }
}
