<?php

namespace App\Models;

use App\Enums\Mlm\LegPosition;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PairingPointLedger extends Model
{
    use HasFactory;

    protected $table = 'pairing_point_ledger';

    protected $fillable = [
        'member_profile_id',
        'leg',
        'points',
        'balance_before',
        'balance_after',
        'reason',
        'reference_id',
        'ledger_date',
    ];

    protected function casts(): array
    {
        return [
            'leg' => LegPosition::class,
            'points' => 'integer',
            'balance_before' => 'integer',
            'balance_after' => 'integer',
            'ledger_date' => 'date',
        ];
    }

    public function memberProfile(): BelongsTo
    {
        return $this->belongsTo(MemberProfile::class);
    }
}
