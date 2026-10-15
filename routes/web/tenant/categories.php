<?php

use App\Http\Controllers\Tenant\CategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/categories', [CategoryController::class, 'index'])
        ->name('tenant.inventory.categories.index')
        ->middleware('permission:tenant.categories.view');

    Route::get('/categories/create', [CategoryController::class, 'create'])
        ->name('tenant.inventory.categories.create')
        ->middleware('permission:tenant.categories.create');

    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('tenant.inventory.categories.store')
        ->middleware('permission:tenant.categories.create');

    Route::get('/categories/{category}', [CategoryController::class, 'show'])
        ->name('tenant.inventory.categories.show')
        ->middleware('permission:tenant.categories.show');

    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])
        ->name('tenant.inventory.categories.edit')
        ->middleware('permission:tenant.categories.edit');

    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->name('tenant.inventory.categories.update')
        ->middleware('permission:tenant.categories.edit');

    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('tenant.inventory.categories.destroy')
        ->middleware('permission:tenant.categories.delete');

    // Export Routes
    Route::post('/categories/export/pdf', [CategoryController::class, 'exportPdf'])
        ->name('tenant.inventory.categories.export.pdf')
        ->middleware('permission:tenant.categories.export');

    Route::post('/categories/export/excel', [CategoryController::class, 'exportExcel'])
        ->name('tenant.inventory.categories.export.excel')
        ->middleware('permission:tenant.categories.export');

});
