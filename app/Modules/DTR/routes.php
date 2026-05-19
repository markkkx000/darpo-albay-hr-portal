<?php

use App\Modules\DTR\Controllers\DTRController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [DTRController::class, 'index'])->name('index');
    Route::post('/export', [DTRController::class, 'export'])->name('export');
});
