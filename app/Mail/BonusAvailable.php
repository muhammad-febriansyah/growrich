<?php

namespace App\Mail;

use App\Models\Bonus;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BonusAvailable extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Bonus $bonus,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bonus baru tersedia – menunggu persetujuan admin',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.bonus-available',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
