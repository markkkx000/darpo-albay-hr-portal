<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

class LogAuthenticationEvents
{
    public function handleUserLogin(Login $event): void
    {
        activity('auth')
            ->causedBy($event->user)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('User logged in');
    }

    public function handleUserLogout(Logout $event): void
    {
        activity('auth')
            ->causedBy($event->user)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('User logged out');
    }

    public function handleUserFailed(Failed $event): void
    {
        activity('auth')
            ->causedBy($event->user)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'email' => $event->credentials['email'] ?? null,
            ])
            ->log('Failed login attempt');
    }
}
