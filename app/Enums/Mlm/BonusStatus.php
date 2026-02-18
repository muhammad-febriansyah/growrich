<?php

namespace App\Enums\Mlm;

enum BonusStatus: string
{
    case Pending = 'Pending';
    case Approved = 'Approved';
    case Paid = 'Paid';
    case Rejected = 'Rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Persetujuan',
            self::Approved => 'Disetujui',
            self::Paid => 'Dibayarkan',
            self::Rejected => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'yellow',
            self::Approved => 'blue',
            self::Paid => 'green',
            self::Rejected => 'red',
        };
    }
}
