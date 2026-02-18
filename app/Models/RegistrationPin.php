<?php

namespace App\Models;

use App\Enums\Mlm\PackageType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationPin extends Model
{
    use HasFactory;

    protected $fillable = [
        'pin_code',
        'package_type',
        'price',
        'purchased_by',
        'assigned_to',
        'used_by',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'package_type' => PackageType::class,
            'price' => 'integer',
        ];
    }

    public function purchasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purchased_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function usedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
