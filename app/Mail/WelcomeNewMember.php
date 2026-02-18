<?php

namespace App\Mail;

use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeNewMember extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public MemberProfile $profile,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Selamat Datang di GrowRich, {$this->user->name}!",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.welcome-new-member',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
