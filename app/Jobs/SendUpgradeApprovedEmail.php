<?php

namespace App\Jobs;

use App\Models\PackageUpgradeRequest;
use App\Services\MailketingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendUpgradeApprovedEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public PackageUpgradeRequest $upgradeRequest) {}

    public function handle(MailketingService $mailer): void
    {
        $user = $this->upgradeRequest->memberProfile->user;

        $html = view('mail.upgrade-approved', [
            'user' => $user,
            'upgradeRequest' => $this->upgradeRequest,
        ])->render();

        $mailer->send(
            recipient: $user->email,
            subject: 'Upgrade Paket Berhasil Disetujui',
            content: $html,
        );
    }
}
