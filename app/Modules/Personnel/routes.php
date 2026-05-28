<?php

use App\Modules\Personnel\Controllers\OrganizationController;
use App\Modules\Personnel\Controllers\PersonnelController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:personnel.view'])->group(function () {
    Route::get('/', [PersonnelController::class, 'index'])->name('index');
    Route::get('/archived', [PersonnelController::class, 'archived'])->name('archived');
    Route::get('/organization', [OrganizationController::class, 'index'])->name('organization.index');
    Route::get('/{user}', [PersonnelController::class, 'show'])->name('show');

    Route::middleware('permission:personnel.manage')->group(function () {
        Route::get('/create', [PersonnelController::class, 'create'])->name('create');
        Route::post('/', [PersonnelController::class, 'store'])->name('store');

        Route::post('/organization/divisions', [OrganizationController::class, 'storeDivision'])->name('organization.divisions.store');
        Route::put('/organization/divisions/{division}', [OrganizationController::class, 'updateDivision'])->name('organization.divisions.update');
        Route::post('/organization/units', [OrganizationController::class, 'storeUnit'])->name('organization.units.store');
        Route::put('/organization/units/{unit}', [OrganizationController::class, 'updateUnit'])->name('organization.units.update');
        Route::post('/organization/positions', [OrganizationController::class, 'storePosition'])->name('organization.positions.store');
        Route::put('/organization/positions/{position}', [OrganizationController::class, 'updatePosition'])->name('organization.positions.update');

        Route::get('/{user}/edit', [PersonnelController::class, 'edit'])->name('edit');
        Route::put('/{user}', [PersonnelController::class, 'update'])->name('update');
        Route::delete('/{user}', [PersonnelController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [PersonnelController::class, 'restore'])->name('restore');
    });

    Route::middleware('permission:roles.manage')->group(function () {
        Route::post('/{user}/reset-password', [PersonnelController::class, 'resetPassword'])->name('reset-password');
    });
});
