<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyBonusRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'run_date',
        'status',
        'started_at',
        'completed_at',
        'total_pairing_bonus',
        'total_matching_bonus',
        'total_leveling_bonus',
    ];

    protected function casts(): array
    {
        return [
            'run_date' => 'date',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'total_pairing_bonus' => 'integer',
            'total_matching_bonus' => 'integer',
            'total_leveling_bonus' => 'integer',
        ];
    }

    public function bonuses(): HasMany
    {
        return $this->hasMany(Bonus::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function totalBonus(): int
    {
        return $this->total_pairing_bonus + $this->total_matching_bonus + $this->total_leveling_bonus;
    }
}
