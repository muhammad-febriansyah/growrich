<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_profile_id',
        'reward_milestone_id',
        'status',
        'qualified_at',
        'fulfilled_at',
    ];

    protected function casts(): array
    {
        return [
            'qualified_at' => 'datetime',
            'fulfilled_at' => 'datetime',
        ];
    }

    public function memberProfile(): BelongsTo
    {
        return $this->belongsTo(MemberProfile::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(RewardMilestone::class, 'reward_milestone_id');
    }

    public function isFulfilled(): bool
    {
        return $this->status === 'fulfilled';
    }
}
