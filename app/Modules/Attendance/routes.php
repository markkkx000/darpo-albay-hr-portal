<?php

use App\Modules\Attendance\Controllers\AttendanceController;
use App\Modules\Attendance\Controllers\AttendanceManagementController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [AttendanceController::class, 'index'])->name('index');
    Route::post('/clock-in', [AttendanceController::class, 'clockIn'])->name('clock-in');
    Route::post('/clock-out', [AttendanceController::class, 'clockOut'])->name('clock-out');

    // Management Routes
    Route::prefix('manage')->name('manage.')->group(function () {
        Route::get('/records', [AttendanceManagementController::class, 'index'])->name('records.index');
        Route::post('/records', [AttendanceManagementController::class, 'store'])->name('records.store');
        Route::put('/records/{attendance}', [AttendanceManagementController::class, 'update'])->name('records.update');
        Route::delete('/records/{attendance}', [AttendanceManagementController::class, 'destroy'])->name('records.destroy');
        Route::post('/records/{id}/restore', [AttendanceManagementController::class, 'restore'])->name('records.restore');
    });
});
