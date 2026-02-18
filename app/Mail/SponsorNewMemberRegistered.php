<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SponsorNewMemberRegistered extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $sponsor,
        public User $newMember,
        public string $packageType,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Member baru berhasil bergabung di jaringan Anda',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.sponsor-new-member-registered',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
