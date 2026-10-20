<?php

use App\Http\Controllers\Admin\PlanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->name('admin.')->group(function () {

    // Submenu: Plans Management
    Route::prefix('plans')->name('plans.')->group(function () {

        // Index / View Plans Catalog
        Route::get('/', [PlanController::class, 'index'])
            ->middleware('permission:central.plans.view')
            ->name('index');

        // Form Create New Plan Tier
        Route::get('/create', [PlanController::class, 'create'])
            ->middleware('permission:central.plans.create')
            ->name('create');

        // Store New Plan Tier
        Route::post('/', [PlanController::class, 'store'])
            ->middleware('permission:central.plans.create')
            ->name('store');

        // Form Edit Plan Tier
        Route::get('/{id}/edit', [PlanController::class, 'edit'])
            ->middleware('permission:central.plans.edit')
            ->name('edit');

        // Update Plan Tier
        Route::put('/{id}', [PlanController::class, 'update'])
            ->middleware('permission:central.plans.edit')
            ->name('update');

        // Delete Plan Tier
        Route::delete('/{id}', [PlanController::class, 'destroy'])
            ->middleware('permission:central.plans.delete')
            ->name('destroy');
    });

});
