<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailketingService
{
    private const ENDPOINT = 'https://api.mailketing.co.id/api/v1/send';

    /**
     * Send an email via the Mailketing API.
     */
    public function send(
        string $recipient,
        string $subject,
        string $content,
    ): bool {
        $settings = SiteSetting::instance();

        if (! $settings->email_sender || ! $settings->email_token) {
            Log::warning('Mailketing: email_sender atau email_token belum dikonfigurasi.');

            return false;
        }

        $response = Http::asForm()->post(self::ENDPOINT, [
            'api_token' => $settings->email_token,
            'from_name' => $settings->site_name ?? config('app.name'),
            'from_email' => $settings->email_sender,
            'recipient' => $recipient,
            'subject' => $subject,
            'content' => $content,
        ]);

        if (! $response->successful()) {
            Log::error('Mailketing: gagal mengirim email.', [
                'recipient' => $recipient,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        }

        return true;
    }
}
