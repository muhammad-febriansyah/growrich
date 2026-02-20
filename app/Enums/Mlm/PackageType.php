<?php

namespace App\Enums\Mlm;

use App\Models\Package;

enum PackageType: string
{
    case Silver = 'Silver';
    case Gold = 'Gold';
    case Platinum = 'Platinum';

    public function pairingPoint(): int
    {
        return Package::findByKey($this->value)->pairing_point;
    }

    public function rewardPoint(): int
    {
        return Package::findByKey($this->value)->reward_point;
    }

    public function maxPairingPerDay(): int
    {
        return Package::findByKey($this->value)->max_pairing_per_day;
    }

    /**
     * Sponsor bonus: min(sponsor_level, new_member_level) × sponsor_bonus_unit
     * Matrix (sponsor \ new member):
     *   Silver×Any      = Rp 200.000
     *   Gold×Silver     = Rp 200.000  | Gold×Gold/Platinum   = Rp 400.000
     *   Platinum×Silver = Rp 200.000  | Platinum×Gold        = Rp 400.000  | Platinum×Platinum = Rp 600.000
     */
    public function sponsorBonusFor(PackageType $newMemberPackage): int
    {
        return Package::findByKey($this->value)->sponsorBonusFor(Package::findByKey($newMemberPackage->value));
    }

    /** @deprecated Use sponsorBonusFor() instead */
    public function sponsorBonus(): int
    {
        return $this->sponsorBonusFor($this);
    }

    /** Pairing bonus per matched pair: Rp 100.000 */
    public static function pairingBonusAmount(): int
    {
        return Package::PAIRING_BONUS_AMOUNT;
    }

    public function registrationPrice(): int
    {
        return Package::findByKey($this->value)->registration_price;
    }

    public function label(): string
    {
        return $this->value;
    }

    /** Price difference to upgrade to next tier */
    public function upgradePrice(): ?int
    {
        return Package::findByKey($this->value)->upgrade_price;
    }

    public function next(): ?PackageType
    {
        $next = Package::findByKey($this->value)->next();

        return $next ? PackageType::from($next->key) : null;
    }
}
