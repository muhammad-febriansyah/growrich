<?php

namespace App\Models;

use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\LegPosition;
use App\Enums\Mlm\PackageType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MemberProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_type',
        'package_status',
        'pin_code',
        'activated_at',
        'left_child_id',
        'right_child_id',
        'parent_id',
        'leg_position',
        'left_pp_total',
        'right_pp_total',
        'left_rp_total',
        'right_rp_total',
        'career_level',
    ];

    protected function casts(): array
    {
        return [
            'package_type' => PackageType::class,
            'leg_position' => LegPosition::class,
            'career_level' => CareerLevel::class,
            'activated_at' => 'datetime',
            'left_pp_total' => 'integer',
            'right_pp_total' => 'integer',
            'left_rp_total' => 'integer',
            'right_rp_total' => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MemberProfile::class, 'parent_id');
    }

    public function leftChild(): HasOne
    {
        return $this->hasOne(MemberProfile::class, 'id', 'left_child_id');
    }

    public function rightChild(): HasOne
    {
        return $this->hasOne(MemberProfile::class, 'id', 'right_child_id');
    }

    public function bonuses(): HasMany
    {
        return $this->hasMany(Bonus::class);
    }

    public function memberRewards(): HasMany
    {
        return $this->hasMany(MemberReward::class);
    }

    public function repeatOrders(): HasMany
    {
        return $this->hasMany(RepeatOrder::class);
    }

    public function pairingPointLedger(): HasMany
    {
        return $this->hasMany(PairingPointLedger::class);
    }

    public function rewardPointLedger(): HasMany
    {
        return $this->hasMany(RewardPointLedger::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('package_status', 'active');
    }

    public function scopeByPackage(Builder $query, PackageType $packageType): Builder
    {
        return $query->where('package_type', $packageType->value);
    }

    public function scopeByCareerLevel(Builder $query, CareerLevel $careerLevel): Builder
    {
        return $query->where('career_level', $careerLevel->value);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->package_status === 'active';
    }

    /** The smaller of left/right PP total — used for pairing & career threshold. */
    public function smallerLegPp(): int
    {
        return min($this->left_pp_total, $this->right_pp_total);
    }

    /** The smaller of left/right RP total — used for reward thresholds. */
    public function smallerLegRp(): int
    {
        return min($this->left_rp_total, $this->right_rp_total);
    }
}
