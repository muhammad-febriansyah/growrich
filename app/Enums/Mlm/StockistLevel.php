<?php

namespace App\Enums\Mlm;

enum StockistLevel: string
{
    case Center = 'center';
    case Point = 'point';
    case Sub = 'sub';

    public function label(): string
    {
        return match ($this) {
            self::Center => 'Stockist Center',
            self::Point => 'Stockist Point',
            self::Sub => 'Sub Stockist',
        };
    }

    public function badge(): string
    {
        return match ($this) {
            self::Center => 'bg-violet-100 text-violet-700 border-violet-300',
            self::Point => 'bg-blue-100 text-blue-700 border-blue-300',
            self::Sub => 'bg-orange-100 text-orange-700 border-orange-300',
        };
    }

    public function sortOrder(): int
    {
        return match ($this) {
            self::Center => 1,
            self::Point => 2,
            self::Sub => 3,
        };
    }
}
