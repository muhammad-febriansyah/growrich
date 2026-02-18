<?php

namespace App\Enums\Mlm;

enum CareerLevel: string
{
    case Member = 'Member';
    case CoreLoader = 'CoreLoader';
    case SapphireManager = 'SapphireManager';
    case RubyManager = 'RubyManager';
    case EmeraldManager = 'EmeraldManager';
    case DiamondManager = 'DiamondManager';
    case BlueDiamondManager = 'BlueDiamondManager';
    case EliteTeamGlobal = 'EliteTeamGlobal';

    public function label(): string
    {
        return match ($this) {
            self::Member => 'Member',
            self::CoreLoader => 'Core Loader',
            self::SapphireManager => 'Sapphire Manager',
            self::RubyManager => 'Ruby Manager',
            self::EmeraldManager => 'Emerald Manager',
            self::DiamondManager => 'Diamond Manager',
            self::BlueDiamondManager => 'Blue Diamond Manager',
            self::EliteTeamGlobal => 'Elite Team Global',
        };
    }

    /**
     * Minimum PP required on EACH leg (left and right) to qualify for this level.
     * Career level is determined by the smaller of the two legs.
     */
    public function requiredPp(): int
    {
        return match ($this) {
            self::Member => 0,
            self::CoreLoader => 25,
            self::SapphireManager => 100,
            self::RubyManager => 500,
            self::EmeraldManager => 1_000,
            self::DiamondManager => 5_000,
            self::BlueDiamondManager => 10_000,
            self::EliteTeamGlobal => 25_000,
        };
    }

    /**
     * Percentage share of national RO pool for Bonus Sharing Global.
     * Formula: (% x Omset RO Nasional) / jumlah member di level yang sama.
     */
    public function globalSharePercent(): float
    {
        return match ($this) {
            self::Member => 0,
            self::CoreLoader => 1.0,
            self::SapphireManager => 1.0,
            self::RubyManager => 1.0,
            self::EmeraldManager => 1.5,
            self::DiamondManager => 2.0,
            self::BlueDiamondManager => 2.5,
            self::EliteTeamGlobal => 3.0,
        };
    }

    public function sortOrder(): int
    {
        return match ($this) {
            self::Member => 0,
            self::CoreLoader => 1,
            self::SapphireManager => 2,
            self::RubyManager => 3,
            self::EmeraldManager => 4,
            self::DiamondManager => 5,
            self::BlueDiamondManager => 6,
            self::EliteTeamGlobal => 7,
        };
    }
}
