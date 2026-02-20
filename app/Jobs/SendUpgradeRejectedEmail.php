<?php

namespace App\Jobs;

use App\Models\PackageUpgradeRequest;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendUpgradeRejectedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public PackageUpgradeRequest $upgradeRequest) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->upgradeRequest->memberProfile->user;

        $html = view('mail.upgrade-rejected', [
            'user' => $user,
            'upgradeRequest' => $this->upgradeRequest,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: 'Pemberitahuan: Permintaan Upgrade Paket Ditolak',
            content: $html,
        );
    }
}
