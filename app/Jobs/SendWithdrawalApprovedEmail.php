<?php

namespace App\Jobs;

use App\Models\Withdrawal;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWithdrawalApprovedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->withdrawal->user;

        $html = view('mail.withdrawal-approved', [
            'user' => $user,
            'withdrawal' => $this->withdrawal,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: 'Penarikan Dana Disetujui',
            content: $html,
        );
    }
}
