<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberDeletionLog extends Model
{
    protected $fillable = [
        'member_id',
        'name',
        'email',
        'phone',
        'package_type',
        'career_level',
        'deleted_by',
    ];

    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
