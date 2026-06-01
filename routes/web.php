<?php

use App\Core\Auth\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Modules\Personnel\Controllers\PersonnelController;
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
});
use App\Core\Controllers\SupportTicketController;

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('userinfo', [PersonnelController::class, 'myRecord'])->name('userinfo');

    // Support Tickets
    Route::get('support/tickets', [SupportTicketController::class, 'index'])->name('support.tickets.index');
    Route::post('support/tickets', [SupportTicketController::class, 'store'])->name('support.tickets.store');
    Route::get('support/tickets/{ticket}', [SupportTicketController::class, 'show'])->name('support.tickets.show');
    Route::post('support/tickets/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('support.tickets.reply');
});

Route::inertia('/', 'welcome', [
    'canRegister' => false,
])->name('home');

require __DIR__.'/settings.php';
