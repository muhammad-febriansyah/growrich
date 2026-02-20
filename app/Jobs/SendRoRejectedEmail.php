<?php

namespace App\Jobs;

use App\Models\RepeatOrder;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendRoRejectedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public RepeatOrder $order) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->order->memberProfile->user;

        $html = view('mail.ro-rejected', [
            'user' => $user,
            'order' => $this->order,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: "Pemberitahuan: Repeat Order #{$this->order->order_number} Ditolak",
            content: $html,
        );
    }
}
