<?php

namespace App\Enums\Mlm;

use App\Models\Package;

enum UpgradePinType: string
{
    case SilverToGold = 'SilverToGold';
    case SilverToPlatinum = 'SilverToPlatinum';
    case GoldToPlatinum = 'GoldToPlatinum';

    public function fromPackage(): PackageType
    {
        return match ($this) {
            self::SilverToGold, self::SilverToPlatinum => PackageType::Silver,
            self::GoldToPlatinum => PackageType::Gold,
        };
    }

    public function toPackage(): PackageType
    {
        return match ($this) {
            self::SilverToGold => PackageType::Gold,
            self::SilverToPlatinum, self::GoldToPlatinum => PackageType::Platinum,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::SilverToGold => 'PIN Upgrade Silver → Gold',
            self::SilverToPlatinum => 'PIN Upgrade Silver → Platinum',
            self::GoldToPlatinum => 'PIN Upgrade Gold → Platinum',
        };
    }

    public function price(): int
    {
        return match ($this) {
            self::SilverToGold => Package::findByKey('Silver')->upgrade_price,
            self::GoldToPlatinum => Package::findByKey('Gold')->upgrade_price,
            self::SilverToPlatinum => Package::findByKey('Silver')->upgrade_price + Package::findByKey('Gold')->upgrade_price,
        };
    }

    /**
     * Return all upgrade types that are available for a given current package.
     *
     * @return array<int, self>
     */
    public static function availableFor(PackageType $currentPackage): array
    {
        return array_filter(
            self::cases(),
            fn (self $type) => $type->fromPackage() === $currentPackage,
        );
    }
}
