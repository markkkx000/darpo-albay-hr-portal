<?php

use App\Http\Controllers\Settings\PreferencesController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/preferences');

    Route::get('settings/preferences', [PreferencesController::class, 'edit'])->name('preferences.edit');
    Route::patch('settings/preferences/notifications', [PreferencesController::class, 'updateNotifications'])->name('preferences.update_notifications');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::post('settings/mfa/setup', [SecurityController::class, 'setupMfa'])
        ->middleware('throttle:5,1')
        ->name('user-mfa.setup');

    Route::post('settings/mfa/resend', [SecurityController::class, 'resendMfa'])
        ->name('user-mfa.resend');

    Route::post('settings/mfa/verify-enable', [SecurityController::class, 'enableMfa'])
        ->name('user-mfa.enable');

    Route::post('settings/mfa/verify-disable', [SecurityController::class, 'disableMfa'])
        ->name('user-mfa.disable');
    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
