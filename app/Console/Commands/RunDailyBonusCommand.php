<?php

namespace App\Console\Commands;

use App\Models\DailyBonusRun;
use App\Services\BonusRunnerService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class RunDailyBonusCommand extends Command
{
    protected $signature = 'bonus:run-daily {date? : Date in Y-m-d format (default: today)}';

    protected $description = 'Run daily bonuses: Pairing, Matching, Leveling, auto career upgrade, reward trigger';

    public function handle(BonusRunnerService $service): int
    {
        $dateStr = $this->argument('date') ?? now()->toDateString();

        try {
            $date = Carbon::parse($dateStr);
        } catch (\Exception $e) {
            $this->error("Invalid date: {$dateStr}");

            return self::FAILURE;
        }

        if (DailyBonusRun::whereDate('run_date', $date->toDateString())->where('status', 'completed')->exists()) {
            $this->warn("Daily bonus run for {$date->toDateString()} already completed. Skipping.");

            return self::FAILURE;
        }

        $this->info("Running daily bonuses for {$date->toDateString()}...");

        $run = $service->runDaily($date);

        $this->info("✅ Done! Run ID: {$run->id} | Status: {$run->status}");
        $this->table(
            ['Bonus Type', 'Total'],
            [
                ['Pairing', 'Rp '.number_format($run->total_pairing_bonus, 0, ',', '.')],
                ['Matching', 'Rp '.number_format($run->total_matching_bonus, 0, ',', '.')],
                ['Leveling', 'Rp '.number_format($run->total_leveling_bonus, 0, ',', '.')],
            ]
        );

        return self::SUCCESS;
    }
}
