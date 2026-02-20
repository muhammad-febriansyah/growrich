<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Package extends Model
{
    /** Fallback pairing bonus per matched pair jika belum dikonfigurasi di site_settings. */
    public const PAIRING_BONUS_AMOUNT = 100_000;

    /**
     * Pairing bonus per matched pair, dibaca dari site_settings.
     * Fallback ke PAIRING_BONUS_AMOUNT jika belum dikonfigurasi.
     */
    public static function pairingBonusAmount(): int
    {
        return SiteSetting::instance()->pairing_bonus_amount ?? self::PAIRING_BONUS_AMOUNT;
    }

    protected $fillable = [
        'key',
        'name',
        'sort_order',
        'pairing_point',
        'reward_point',
        'max_pairing_per_day',
        'registration_price',
        'upgrade_price',
        'sponsor_bonus_unit',
        'leveling_bonus_amount',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'pairing_point' => 'integer',
        'reward_point' => 'integer',
        'max_pairing_per_day' => 'integer',
        'registration_price' => 'integer',
        'upgrade_price' => 'integer',
        'sponsor_bonus_unit' => 'integer',
        'leveling_bonus_amount' => 'integer',
    ];

    // ── Relationships ──────────────────────────────────────────────────────────

    public function memberProfiles(): HasMany
    {
        return $this->hasMany(MemberProfile::class, 'package_type', 'key');
    }

    public function registrationPins(): HasMany
    {
        return $this->hasMany(RegistrationPin::class, 'package_type', 'key');
    }

    // ── Scopes ─────────────────────────────────────────────────────────────────

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }

    // ── Static helpers ─────────────────────────────────────────────────────────

    /**
     * Find a package by its key, with a 10-minute cache.
     */
    public static function findByKey(string $key): static
    {
        return Cache::remember('package_'.$key, 600, fn () => static::where('key', $key)->firstOrFail());
    }

    /**
     * Clear the cached entry for this package (call after update/delete).
     */
    public function clearCache(): void
    {
        Cache::forget('package_'.$this->key);
    }

    // ── Business logic ─────────────────────────────────────────────────────────

    /**
     * Sponsor bonus: min(sponsor level, new member level) × sponsor_bonus_unit
     * Matrix (sponsor \ new member):
     *   Silver×Any      = Rp 200.000
     *   Gold×Silver     = Rp 200.000  | Gold×Gold/Platinum   = Rp 400.000
     *   Platinum×Silver = Rp 200.000  | Platinum×Gold        = Rp 400.000  | Platinum×Plat = Rp 600.000
     */
    public function sponsorBonusFor(Package $newMemberPackage): int
    {
        return min($this->sort_order, $newMemberPackage->sort_order) * $this->sponsor_bonus_unit;
    }

    /**
     * Return the next-tier Package (by sort_order), or null for Platinum.
     */
    public function next(): ?static
    {
        return static::where('sort_order', '>', $this->sort_order)
            ->orderBy('sort_order')
            ->first();
    }

    public function label(): string
    {
        return $this->name;
    }
}
