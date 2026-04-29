<?php

use App\Modules\Notifications\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/recent', [NotificationController::class, 'recent'])->name('recent');
    Route::post('/{id}/read', [NotificationController::class, 'read'])->name('read');
    Route::post('/{id}/unread', [NotificationController::class, 'unread'])->name('unread');
    Route::post('/read-all', [NotificationController::class, 'readAll'])->name('read-all');
});
