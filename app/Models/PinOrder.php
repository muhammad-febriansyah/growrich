<?php

namespace App\Models;

use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UpgradePinType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PinOrder extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'package_type',
        'upgrade_from',
        'quantity',
        'unit_price',
        'total_amount',
        'status',
        'payment_method',
        'payment_url',
        'payment_receipt',
        'duitku_reference',
        'paid_at',
        'phone',
        'shipping_name',
        'shipping_address',
        'shipping_province',
        'shipping_city',
        'shipping_district',
        'shipping_village',
        'shipping_postal_code',
        'notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'package_type' => PackageType::class,
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'total_amount' => 'integer',
            'completed_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function isPaid(): bool
    {
        return $this->paid_at !== null;
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

        $packageValue = $this->package_type instanceof PackageType
            ? $this->package_type->value
            : $this->package_type;

        foreach (UpgradePinType::cases() as $type) {
            if (
                $type->fromPackage()->value === $this->upgrade_from
                && $type->toPackage()->value === $packageValue
            ) {
                return $type;
            }
        }

        return null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateOrderNumber(): string
    {
        $prefix = 'PO-'.now()->format('Ymd').'-';
        $count = self::whereDate('created_at', today())->count() + 1;

        return $prefix.str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }
}
