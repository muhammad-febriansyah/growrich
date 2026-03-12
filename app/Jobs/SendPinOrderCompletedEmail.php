<?php

namespace App\Jobs;

use App\Models\PinOrder;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPinOrderCompletedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public PinOrder $pinOrder) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->pinOrder->user;

        if (! $user) {
            return;
        }

        $html = view('mail.pin-order-completed', [
            'user' => $user,
            'order' => $this->pinOrder,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: "Order PIN #{$this->pinOrder->order_number} Telah Dikonfirmasi",
            content: $html,
        );
    }
}
