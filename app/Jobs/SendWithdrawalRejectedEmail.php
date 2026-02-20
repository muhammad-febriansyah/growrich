<?php

namespace App\Jobs;

use App\Models\Withdrawal;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendWithdrawalRejectedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->withdrawal->user;

        $html = view('mail.withdrawal-rejected', [
            'user' => $user,
            'withdrawal' => $this->withdrawal,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: 'Pemberitahuan: Penarikan Dana Ditolak',
            content: $html,
        );
    }
}
