<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PreferencesController extends Controller
{
    /**
     * Show the user's preferences settings page.
     */
    public function edit(Request $request): Response
    {
        $defaultPreferences = [
            'system' => true,
            'announcements' => true,
            'updates' => true,
        ];

        $userPreferences = $request->user()->notification_preferences ?? [];

        return Inertia::render('settings/preferences', [
            'notificationPreferences' => array_merge($defaultPreferences, $userPreferences),
        ]);
    }

    /**
     * Update the user's notification preferences.
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'system' => ['required', 'boolean'],
            'announcements' => ['required', 'boolean'],
            'updates' => ['required', 'boolean'],
        ]);

        $request->user()->update([
            'notification_preferences' => $validated,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notification preferences updated.')]);

        return back();
    }
}
