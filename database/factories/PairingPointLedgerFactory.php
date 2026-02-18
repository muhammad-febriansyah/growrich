<?php

namespace Database\Factories;

use App\Enums\Mlm\LegPosition;
use App\Models\MemberProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PairingPointLedger>
 */
class PairingPointLedgerFactory extends Factory
{
    public function definition(): array
    {
        $points = fake()->numberBetween(100, 2000);
        $balanceBefore = fake()->numberBetween(0, 50_000);

        return [
            'member_profile_id' => MemberProfile::factory(),
            'leg' => fake()->randomElement(LegPosition::cases())->value,
            'points' => $points,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceBefore + $points,
            'reason' => fake()->randomElement(['registration', 'pairing_deduct']),
            'reference_id' => null,
            'ledger_date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
        ];
    }
}
