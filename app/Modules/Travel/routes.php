<?php

use App\Modules\Travel\Controllers\TravelOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', [TravelOrderController::class, 'index'])->name('index');
});
