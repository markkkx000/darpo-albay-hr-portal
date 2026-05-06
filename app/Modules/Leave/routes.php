<?php

use App\Modules\Leave\Controllers\HolidayController;
use App\Modules\Leave\Controllers\LeaveController;
use App\Modules\Leave\Controllers\LeaveCreditController;
use App\Modules\Leave\Controllers\LeaveStatusController;
use App\Modules\Leave\Controllers\LeaveTypeController;
use App\Modules\Leave\Controllers\TardinessController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'permission:leave.access_module|leave.view_own'])->group(function () {

    // Dashboard (Index) - Accessible to both employees and HR
    Route::get('/', [LeaveController::class, 'index'])->name('index');

    // Credits (restricted to manage_credits)
    Route::middleware('permission:leave.manage_credits')->group(function () {
        Route::get('/credits', [LeaveCreditController::class, 'index'])->name('credits.index');
        Route::put('/credits', [LeaveCreditController::class, 'update'])->name('credits.update');
    });

    // Tardiness (restricted to manage_tardiness)
    Route::middleware('permission:leave.manage_tardiness')->group(function () {
        Route::get('/tardiness', [TardinessController::class, 'index'])->name('tardiness.index');
        Route::put('/tardiness/{user_id}', [TardinessController::class, 'update'])->name('tardiness.update');
    });

    // Settings (restricted to manage_settings)
    Route::middleware('permission:leave.manage_settings')->group(function () {
        Route::get('/settings', [LeaveController::class, 'settings'])->name('settings');

        // Holidays
        Route::post('/holidays', [HolidayController::class, 'store'])->name('holidays.store');
        Route::put('/holidays/{holiday}', [HolidayController::class, 'update'])->name('holidays.update');
        Route::delete('/holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');

        // Leave Types
        Route::post('/types', [LeaveTypeController::class, 'store'])->name('types.store');
        Route::put('/types/{leaveType}', [LeaveTypeController::class, 'update'])->name('types.update');
        Route::delete('/types/{leaveType}', [LeaveTypeController::class, 'destroy'])->name('types.destroy');

        // Leave Statuses
        Route::post('/statuses', [LeaveStatusController::class, 'store'])->name('statuses.store');
        Route::put('/statuses/{leaveStatus}', [LeaveStatusController::class, 'update'])->name('statuses.update');
        Route::delete('/statuses/{leaveStatus}', [LeaveStatusController::class, 'destroy'])->name('statuses.destroy');
    });

    // Routes restricted to users who can encode leaves (HR/Admin)
    Route::middleware('permission:leave.encode')->group(function () {
        Route::get('/create', [LeaveController::class, 'create'])->name('create');
        Route::post('/', [LeaveController::class, 'store'])->name('store');
        Route::get('/calendar', [LeaveController::class, 'calendar'])->name('calendar');

        // Dynamic Leave Request Routes (edit/update/delete)
        Route::get('/{leaveRequest}/edit', [LeaveController::class, 'edit'])->name('edit');
        Route::put('/{leaveRequest}', [LeaveController::class, 'update'])->name('update');
        Route::delete('/{leaveRequest}', [LeaveController::class, 'destroy'])->name('destroy');
    });

    // Parameterized routes last to avoid capturing static routes
    Route::get('/{leaveRequest}', [LeaveController::class, 'show'])->name('show');
});
