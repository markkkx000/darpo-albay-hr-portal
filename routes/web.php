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

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('userinfo', [PersonnelController::class, 'myRecord'])->name('userinfo');
});

Route::inertia('/', 'welcome', [
    'canRegister' => false,
])->name('home');

Route::get('ping', fn () => response()->json(['status' => 'ok']))->name('ping');

require __DIR__.'/settings.php';
