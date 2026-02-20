<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWelcomeRegistrationEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user) {}

    public function handle(MailketingService $mailer): void
    {
        $html = view('mail.welcome-registration', [
            'user' => $this->user,
        ])->render();

        $mailer->send(
            recipient: $this->user->email,
            subject: "Selamat Datang di GrowRich, {$this->user->name}!",
            content: $html,
        );
    }
}
