<?php

use App\Modules\Roles\Controllers\RoleController;
use App\Modules\Roles\Controllers\UserRoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:roles.manage'])->group(function () {
    Route::get('/', [RoleController::class, 'index'])->name('index');
    Route::post('/', [RoleController::class, 'store'])->name('store');
    Route::put('/{role}', [RoleController::class, 'update'])->name('update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');

    Route::get('/users', [UserRoleController::class, 'index'])->name('users.index');
    Route::put('/users/{user}/assign', [UserRoleController::class, 'assign'])->name('users.assign');
});
