<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PinTransferLog extends Model
{
    protected $fillable = [
        'pin_id',
        'from_user_id',
        'to_user_id',
        'transferred_by',
        'actor_type',
    ];

    public function pin(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RegistrationPin::class, 'pin_id');
    }

    public function fromUser(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function transferredBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }
}
