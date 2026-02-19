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

    /**
     * Sponsor bonus: min(sponsor_level, new_member_level) × Rp 200.000
     * Matrix (sponsor \ new member):
     *   Silver×Any      = Rp 200.000
     *   Gold×Silver     = Rp 200.000  | Gold×Gold/Platinum   = Rp 400.000
     *   Platinum×Silver = Rp 200.000  | Platinum×Gold        = Rp 400.000  | Platinum×Platinum = Rp 600.000
     */
    public function sponsorBonusFor(PackageType $newMemberPackage): int
    {
        $level = fn (PackageType $p): int => match ($p) {
            self::Silver => 1,
            self::Gold => 2,
            self::Platinum => 3,
        };

        return min($level($this), $level($newMemberPackage)) * 200_000;
    }

    /** @deprecated Use sponsorBonusFor() instead */
    public function sponsorBonus(): int
    {
        return $this->sponsorBonusFor($this);
    }

    /** Pairing bonus per matched pair: Rp 100.000 */
    public static function pairingBonusAmount(): int
    {
        return 100_000;
    }

    public function registrationPrice(): int
    {
        return match ($this) {
            self::Silver => 2_450_000,
            self::Gold => 4_900_000,
            self::Platinum => 7_350_000,
        };
    }

    public function label(): string
    {
        return $this->value;
    }

    /** Price difference to upgrade to next tier */
    public function upgradePrice(): ?int
    {
        return match ($this) {
            self::Silver => 2_450_000,
            self::Gold => 2_450_000,
            self::Platinum => null,
        };
    }

    public function next(): ?PackageType
    {
        return match ($this) {
            self::Silver => self::Gold,
            self::Gold => self::Platinum,
            self::Platinum => null,
        };
    }
}
