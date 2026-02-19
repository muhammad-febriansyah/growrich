<?php

namespace App\Console\Commands;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Mail\BonusAvailable;
use App\Models\Bonus;
use App\Models\DailyBonusRun;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class BonusRunDaily extends Command
{
    protected $signature = 'bonus:run-daily {date? : Format Y-m-d, default hari ini}';

    protected $description = 'Hitung dan buat Pairing Bonus harian untuk semua member aktif';

    public function handle(): int
    {
        $runDate = $this->argument('date')
            ? Carbon::parse($this->argument('date'))->startOfDay()
            : today();

        if (DailyBonusRun::whereDate('run_date', $runDate)->exists()) {
            $this->warn("Daily bonus run untuk {$runDate->toDateString()} sudah dijalankan. Keluar.");

            return self::FAILURE;
        }

        $dailyRun = DailyBonusRun::create([
            'run_date' => $runDate->toDateString(),
            'status' => 'running',
            'started_at' => now(),
            'total_pairing_bonus' => 0,
            'total_matching_bonus' => 0,
            'total_leveling_bonus' => 0,
        ]);

        $totalPairingBonus = 0;

        MemberProfile::active()->with('user')->chunk(100, function ($profiles) use ($runDate, $dailyRun, &$totalPairingBonus) {
            foreach ($profiles as $profile) {
                $leftGained = PairingPointLedger::where('member_profile_id', $profile->id)
                    ->where('leg', 'left')
                    ->whereDate('ledger_date', $runDate)
                    ->sum('points');

                $rightGained = PairingPointLedger::where('member_profile_id', $profile->id)
                    ->where('leg', 'right')
                    ->whereDate('ledger_date', $runDate)
                    ->sum('points');

                $pairs = min($leftGained, $rightGained);
                $maxPairs = $profile->package_type->maxPairingPerDay();
                $pairs = min($pairs, $maxPairs);

                if ($pairs <= 0) {
                    continue;
                }

                $amount = $pairs * \App\Enums\Mlm\PackageType::pairingBonusAmount();
                $ewalletAmount = (int) ($amount * 0.2);
                $cashAmount = $amount - $ewalletAmount;

                $bonus = Bonus::create([
                    'member_profile_id' => $profile->id,
                    'bonus_type' => BonusType::Pairing->value,
                    'amount' => $amount,
                    'ewallet_amount' => $ewalletAmount,
                    'cash_amount' => $cashAmount,
                    'status' => BonusStatus::Pending->value,
                    'bonus_date' => $runDate->toDateString(),
                    'period_month' => (int) $runDate->format('n'),
                    'period_year' => (int) $runDate->format('Y'),
                    'daily_bonus_run_id' => $dailyRun->id,
                ]);

                $totalPairingBonus += $amount;

                if ($profile->user) {
                    Mail::to($profile->user->email)->queue(new BonusAvailable($profile->user, $bonus));
                }
            }
        });

        $dailyRun->update([
            'status' => 'completed',
            'completed_at' => now(),
            'total_pairing_bonus' => $totalPairingBonus,
        ]);

        $this->info('Selesai. Total pairing bonus: Rp '.number_format($totalPairingBonus, 0, ',', '.'));

        return self::SUCCESS;
    }
}
