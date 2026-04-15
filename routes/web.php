<?php

use App\Core\Auth\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Custom Auth Routes
|--------------------------------------------------------------------------
| Fully custom authentication routes using Laravel's Auth facade.
*/

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AuthController::class, 'login'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::inertia('/', 'welcome', [
    'canRegister' => false,
])->name('home');

require __DIR__.'/settings.php';
