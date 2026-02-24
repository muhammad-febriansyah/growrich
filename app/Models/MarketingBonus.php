<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketingBonus extends Model
{
    protected $fillable = [
        'category',
        'icon',
        'icon_color',
        'tag',
        'tag_color',
        'title',
        'description',
        'details',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'details' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
