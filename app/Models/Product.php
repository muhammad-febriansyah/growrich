<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $appends = ['image_url'];

    protected $fillable = [
        'name',
        'description',
        'sku',
        'unit',
        'image',
        'regular_price',
        'ro_price',
        'member_discount',
        'is_active',
        'stock',
        'bpom_number',
    ];

    protected function casts(): array
    {
        return [
            'regular_price' => 'integer',
            'ro_price' => 'integer',
            'member_discount' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::url($this->image) : null;
    }

    public function repeatOrderItems(): HasMany
    {
        return $this->hasMany(RepeatOrderItem::class);
    }

    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_active', true);
    }
}
