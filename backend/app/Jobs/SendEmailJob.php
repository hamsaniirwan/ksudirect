<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $recipientEmail;
    protected $mailable;

    public function __construct($recipientEmail, $mailable)
    {
        $this->recipientEmail = $recipientEmail;
        $this->mailable = $mailable;
    }

    public function handle(): void
    {
        // Hantar e-mel secara nyata
        Mail::to($this->recipientEmail)->send($this->mailable);
    }
}