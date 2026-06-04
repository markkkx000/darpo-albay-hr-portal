<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PersonalDataExportReady extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $downloadUrl)
    {
        //
    }

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
        return (new MailMessage)
            ->subject('Your Personal Data Export is Ready')
            ->greeting('Hello ' . $notifiable->first_name . ',')
            ->line('You recently requested an export of your personal data (DSAR).')
            ->line('Your export file has been generated successfully and is ready for download.')
            ->action('Download My Data', $this->downloadUrl)
            ->line('For security reasons, this link will expire in 24 hours. The generated file will also be deleted from our servers automatically.')
            ->line('If you did not request this data, please contact HR immediately.');
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
