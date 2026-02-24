<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RepeatOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_profile_id',
        'order_number',
        'total_amount',
        'status',
        'period_month',
        'period_year',
        'payment_method',
        'payment_url',
        'payment_receipt',
        'duitku_reference',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'period_month' => 'integer',
            'period_year' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function isPaid(): bool
    {
        return $this->paid_at !== null;
    }

    public function memberProfile(): BelongsTo
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(RepeatOrderItem::class);
    }
}
