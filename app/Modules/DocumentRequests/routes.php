<?php

use App\Modules\DocumentRequests\Controllers\DocumentRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [DocumentRequestController::class, 'index'])->name('index');
    Route::get('create', [DocumentRequestController::class, 'create'])->name('create');
    Route::post('/', [DocumentRequestController::class, 'store'])->name('store');
    Route::get('{documentRequest}', [DocumentRequestController::class, 'show'])->name('show');
    Route::post('{documentRequest}/acknowledge', [DocumentRequestController::class, 'acknowledge'])->name('acknowledge');

    // HR Only routes
    Route::middleware('permission:document_requests.manage')->group(function () {
        Route::post('{documentRequest}/receive', [DocumentRequestController::class, 'markAsReceived'])->name('receive');
        Route::post('{documentRequest}/release', [DocumentRequestController::class, 'release'])->name('release');
        Route::post('{documentRequest}/picked-up', [DocumentRequestController::class, 'markAsPickedUp'])->name('picked-up');
    });

    // General status update (cancel/reject)
    Route::post('{documentRequest}/status', [DocumentRequestController::class, 'updateStatus'])->name('status');
});
