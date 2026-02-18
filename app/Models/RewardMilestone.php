<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RewardMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'reward_type',
        'required_left_rp',
        'required_right_rp',
        'cash_value',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'required_left_rp' => 'integer',
            'required_right_rp' => 'integer',
            'cash_value' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function memberRewards(): HasMany
    {
        return $this->hasMany(MemberReward::class);
    }
}
