<?php

namespace App\Enums\Mlm;

enum LegPosition: string
{
    case Left = 'left';
    case Right = 'right';

    public function label(): string
    {
        return match ($this) {
            self::Left => 'Kiri',
            self::Right => 'Kanan',
        };
    }

    public function opposite(): self
    {
        return match ($this) {
            self::Left => self::Right,
            self::Right => self::Left,
        };
    }
}
