<?php

namespace App\Enums\Mlm;

enum PackageType: string
{
    case Silver = 'Silver';
    case Gold = 'Gold';
    case Platinum = 'Platinum';

    public function pairingPoint(): int
    {
        return match ($this) {
            self::Silver => 1,
            self::Gold => 2,
            self::Platinum => 3,
        };
    }

    public function rewardPoint(): int
    {
        return match ($this) {
            self::Silver => 0,
            self::Gold => 1,
            self::Platinum => 2,
        };
    }

    public function maxPairingPerDay(): int
    {
        return match ($this) {
            self::Silver => 10,
            self::Gold => 20,
            self::Platinum => 30,
        };
    }

    public function sponsorBonus(): int
    {
        return match ($this) {
            self::Silver => 500_000,
            self::Gold => 1_000_000,
            self::Platinum => 1_500_000,
        };
    }

    public function registrationPrice(): int
    {
        return match ($this) {
            self::Silver => 2_450_000,
            self::Gold => 4_900_000,
            self::Platinum => 7_350_000,
        };
    }
}
