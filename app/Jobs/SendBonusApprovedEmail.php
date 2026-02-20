<?php

namespace App\Jobs;

use App\Models\Bonus;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendBonusApprovedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public Bonus $bonus) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->bonus->memberProfile->user;

        $html = view('mail.bonus-approved', [
            'user' => $user,
            'bonus' => $this->bonus,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: 'Bonus Anda Telah Disetujui',
            content: $html,
        );
    }
}
