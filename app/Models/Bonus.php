<?php

namespace App\Models;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bonus extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_profile_id',
        'bonus_type',
        'amount',
        'ewallet_amount',
        'cash_amount',
        'status',
        'approved_by',
        'bonus_date',
        'period_month',
        'period_year',
        'meta',
        'daily_bonus_run_id',
    ];

    protected function casts(): array
    {
        return [
            'bonus_type' => BonusType::class,
            'status' => BonusStatus::class,
            'amount' => 'integer',
            'ewallet_amount' => 'integer',
            'cash_amount' => 'integer',
            'period_month' => 'integer',
            'period_year' => 'integer',
            'bonus_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function memberProfile(): BelongsTo
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function dailyBonusRun(): BelongsTo
    {
        return $this->belongsTo(DailyBonusRun::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', BonusStatus::Pending->value);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', BonusStatus::Approved->value);
    }

    public function scopeByType(Builder $query, BonusType $bonusType): Builder
    {
        return $query->where('bonus_type', $bonusType->value);
    }
}
