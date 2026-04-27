<?php

use App\Modules\Announcements\Controllers\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [AnnouncementController::class, 'index'])->name('index');
    Route::get('/manage', [AnnouncementController::class, 'manage'])->name('manage');
    Route::get('/create', [AnnouncementController::class, 'create'])->name('create');
    Route::post('/', [AnnouncementController::class, 'store'])->name('store');

    // Dynamic routes last
    Route::get('/{announcement}', [AnnouncementController::class, 'show'])->name('show');
    Route::get('/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('edit');
    Route::put('/{announcement}', [AnnouncementController::class, 'update'])->name('update');
    Route::post('/{announcement}/publish', [AnnouncementController::class, 'publish'])->name('publish');
    Route::delete('/{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy');
});
