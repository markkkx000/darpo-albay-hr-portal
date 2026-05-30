<?php

use App\Modules\Audit\Controllers\AuditController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:system.audit'])->group(function () {
    Route::get('/admin/system-audit', [AuditController::class, 'index'])->name('index');
    Route::get('/admin/system-audit/export', [AuditController::class, 'export'])->name('export');
});
