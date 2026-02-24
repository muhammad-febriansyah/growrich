<?php

namespace App\Models;

use App\Enums\Mlm\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'avatar',
        'referral_code',
        'member_id',
        'sponsor_id',
        'role',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    public function memberProfile(): HasOne
    {
        return $this->hasOne(MemberProfile::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(User::class, 'sponsor_id');
    }

    /**
     * Generate a unique member ID based on package prefix.
     *
     * Prefixes:
     *  - Silver (new)            → S
     *  - Gold (new)              → G
     *  - Gold (upgrade)          → GU
     *  - Platinum (new)          → P
     *  - Platinum (upgrade)      → PU
     *
     * Format: {PREFIX}{10-digit zero-padded sequential number}
     * Example: S0000000001, GU0000000001
     */
    public static function generateMemberId(string $prefix): string
    {
        $prefix = strtoupper($prefix);

        do {
            $count = self::where('member_id', 'like', $prefix.'%')->count();
            $next = $count + 1;
            $memberId = $prefix.str_pad((string) $next, 10, '0', STR_PAD_LEFT);
        } while (self::where('member_id', $memberId)->exists());

        return $memberId;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isMember(): bool
    {
        return $this->role === UserRole::Member;
    }
}
