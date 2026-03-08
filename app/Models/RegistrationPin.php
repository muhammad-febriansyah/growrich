<?php

namespace App\Models;

use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UpgradePinType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationPin extends Model
{
    use HasFactory;

    protected $fillable = [
        'pin_code',
        'package_type',
        'upgrade_from',
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

    public function isUpgradePin(): bool
    {
        return $this->upgrade_from !== null;
    }

    public function upgradePinType(): ?UpgradePinType
    {
        if (! $this->isUpgradePin()) {
            return null;
        }

        foreach (UpgradePinType::cases() as $type) {
            if (
                $type->fromPackage()->value === $this->upgrade_from
                && $type->toPackage()->value === ($this->package_type instanceof PackageType ? $this->package_type->value : $this->package_type)
            ) {
                return $type;
            }
        }

        return null;
    }
}
