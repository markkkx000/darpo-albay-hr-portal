<?php

use App\Modules\YearlyReport\Controllers\YearlyReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [YearlyReportController::class, 'index'])->name('index');
    Route::get('/export', [YearlyReportController::class, 'export'])->name('export');
});
