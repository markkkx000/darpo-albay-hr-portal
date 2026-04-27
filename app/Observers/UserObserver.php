<?php

namespace App\Observers;

use App\Core\Services\NotificationService;
use App\Models\User;

class UserObserver
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        if ($user->wasChanged('password')) {
            $this->notificationService->dismissBySubtype($user, 'default_password');
        }
    }
}
