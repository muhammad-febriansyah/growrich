<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Request;

class LogUserLogin
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        ActivityLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->role?->value ?? $user->role,
            'action' => 'login',
            'description' => "User '{$user->name}' berhasil login.",
            'ip_address' => Request::ip(),
        ]);
    }
}
