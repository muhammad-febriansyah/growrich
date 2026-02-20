<?php

namespace App\Jobs;

use App\Models\Withdrawal;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWithdrawalSubmittedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->withdrawal->user;

        $html = view('mail.withdrawal-submitted', [
            'user' => $user,
            'withdrawal' => $this->withdrawal,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: 'Permintaan Penarikan Dana Diterima',
            content: $html,
        );
    }
}
