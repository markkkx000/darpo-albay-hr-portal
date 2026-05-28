<?php

use App\Modules\Announcements\Controllers\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [AnnouncementController::class, 'index'])->name('index');

    // Dynamic routes last for view
    Route::get('/{announcement}', [AnnouncementController::class, 'show'])->name('show');

    Route::middleware('permission:announcements.manage')->group(function () {
        Route::get('/manage', [AnnouncementController::class, 'manage'])->name('manage');
        Route::get('/create', [AnnouncementController::class, 'create'])->name('create');
        Route::post('/', [AnnouncementController::class, 'store'])->name('store');
        Route::post('/upload-asset', [AnnouncementController::class, 'uploadAsset'])->name('upload-asset');

        Route::get('/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('edit');
        Route::put('/{announcement}', [AnnouncementController::class, 'update'])->name('update');
        Route::post('/{announcement}/publish', [AnnouncementController::class, 'publish'])->name('publish');
        Route::delete('/{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy');
    });
});
