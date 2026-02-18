<?php

namespace Database\Factories;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Models\MemberProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bonus>
 */
class BonusFactory extends Factory
{
    public function definition(): array
    {
        $amount = fake()->numberBetween(50_000, 2_000_000);
        $ewalletAmount = (int) ($amount * 0.2);
        $cashAmount = $amount - $ewalletAmount;
        $bonusDate = fake()->dateTimeBetween('-3 months', 'now');

        return [
            'member_profile_id' => MemberProfile::factory(),
            'bonus_type' => fake()->randomElement(BonusType::cases())->value,
            'amount' => $amount,
            'ewallet_amount' => $ewalletAmount,
            'cash_amount' => $cashAmount,
            'status' => BonusStatus::Pending->value,
            'approved_by' => null,
            'bonus_date' => $bonusDate->format('Y-m-d'),
            'period_month' => (int) $bonusDate->format('n'),
            'period_year' => (int) $bonusDate->format('Y'),
            'meta' => null,
            'daily_bonus_run_id' => null,
        ];
    }

    public function ofType(BonusType $bonusType): static
    {
        return $this->state(fn (array $attributes) => [
            'bonus_type' => $bonusType->value,
        ]);
    }

    public function approved(int $approvedBy): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BonusStatus::Approved->value,
            'approved_by' => $approvedBy,
        ]);
    }

    public function paid(int $approvedBy): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BonusStatus::Paid->value,
            'approved_by' => $approvedBy,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BonusStatus::Rejected->value,
        ]);
    }
}
