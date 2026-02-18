<?php

namespace App\Enums\Mlm;

enum BonusType: string
{
    case Sponsor = 'Sponsor';
    case Pairing = 'Pairing';
    case Matching = 'Matching';
    case Leveling = 'Leveling';
    case RepeatOrder = 'RepeatOrder';
    case GlobalSharing = 'GlobalSharing';

    public function label(): string
    {
        return match ($this) {
            self::Sponsor => 'Sponsor Bonus',
            self::Pairing => 'Pairing Bonus',
            self::Matching => 'Matching Bonus',
            self::Leveling => 'Leveling Bonus',
            self::RepeatOrder => 'Repeat Order Bonus',
            self::GlobalSharing => 'Global Sharing Bonus',
        };
    }

    public function isDaily(): bool
    {
        return in_array($this, [self::Pairing, self::Matching, self::Leveling]);
    }

    public function isMonthly(): bool
    {
        return in_array($this, [self::RepeatOrder, self::GlobalSharing]);
    }
}
