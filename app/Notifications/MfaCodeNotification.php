<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MfaCodeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $code,
        public string $context = 'login'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Your Two-Factor Authentication Code')
            ->greeting('Hello '.$notifiable->first_name.',');

        if ($this->context === 'enable') {
            $message->line('You have requested to enable Two-Factor Authentication for your account. Please use the following 6-digit code to complete the setup.');
        } elseif ($this->context === 'disable') {
            $message->line('You have requested to disable Two-Factor Authentication for your account. Please use the following 6-digit code to verify this action.');
        } else {
            $message->line('You have requested to log in. Please use the following 6-digit code to complete your authentication.');
        }

        return $message
            ->line('**'.$this->code.'**')
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not request this code, please ignore this email or contact the administrator if you believe your account is compromised.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
