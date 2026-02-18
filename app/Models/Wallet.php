<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function credit(int $amount, string $description, ?string $referenceType = null, ?int $referenceId = null): WalletTransaction
    {
        $balanceBefore = $this->balance;
        $this->increment('balance', $amount);

        return $this->transactions()->create([
            'type' => 'credit',
            'amount' => $amount,
            'description' => $description,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
        ]);
    }

    public function debit(int $amount, string $description, ?string $referenceType = null, ?int $referenceId = null): WalletTransaction
    {
        $balanceBefore = $this->balance;
        $this->decrement('balance', $amount);

        return $this->transactions()->create([
            'type' => 'debit',
            'amount' => $amount,
            'description' => $description,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
        ]);
    }

    public function hasSufficientBalance(int $amount): bool
    {
        return $this->balance >= $amount;
    }
}
