<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareerLevel extends Model
{
    protected $fillable = [
        'key',
        'label',
        'required_pp',
        'global_share_percent',
        'sort_order',
        'dot_color',
        'text_color',
        'is_active',
    ];

    protected $casts = [
        'required_pp' => 'integer',
        'global_share_percent' => 'float',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}
