<?php

use App\Core\Auth\Controllers\AuthController;
use App\Core\Auth\Controllers\MfaController;
use App\Core\Auth\Controllers\PasswordResetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PersonalDataExportController;
use App\Modules\Personnel\Controllers\PersonnelController;
use Spatie\Health\Http\Controllers\HealthCheckResultsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Custom Auth Routes
|--------------------------------------------------------------------------
| Fully custom authentication routes using Laravel's Auth facade.
*/

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login.store');

    Route::get('mfa/verify', [MfaController::class, 'show'])->name('mfa.show');
    Route::post('mfa/verify', [MfaController::class, 'verify'])->middleware('throttle:5,1')->name('mfa.verify');
    Route::post('mfa/resend', [MfaController::class, 'resend'])->name('mfa.resend');

    Route::get('forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('reset-password', [PasswordResetController::class, 'update'])->name('password.update');
});
Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('userinfo', [PersonnelController::class, 'myRecord'])->name('userinfo');
    
    // DSAR
    Route::post('/dsar/export', [PersonalDataExportController::class, 'store'])->name('dsar.export');
    Route::get('/dsar/download/{filename}', [PersonalDataExportController::class, 'download'])->name('dsar.download');

    Route::get('/health', HealthCheckResultsController::class)
        ->middleware('can:roles.manage')
        ->name('health.panel');
});

Route::inertia('/', 'welcome', [
    'canRegister' => false,
])->name('home');

require __DIR__.'/settings.php';
