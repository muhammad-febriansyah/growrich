<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatSession extends Model
{
    protected $fillable = [
        'token',
        'visitor_name',
        'visitor_email',
        'status',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'last_activity_at' => 'datetime',
        ];
    }

    public static function findOrCreateByToken(string $token): self
    {
        return self::firstOrCreate(
            ['token' => $token],
            ['status' => 'bot', 'last_activity_at' => now()]
        );
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at');
    }

    public function isBot(): bool
    {
        return $this->status === 'bot';
    }
}
