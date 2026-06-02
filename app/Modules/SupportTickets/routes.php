<?php

use App\Modules\SupportTickets\Controllers\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [SupportTicketController::class, 'index'])->name('index');
    Route::post('/', [SupportTicketController::class, 'store'])->name('store');
    Route::post('/refresh', [SupportTicketController::class, 'refresh'])->name('refresh');
    Route::get('/{ticket}', [SupportTicketController::class, 'show'])->name('show');
    Route::post('/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('reply');
});
