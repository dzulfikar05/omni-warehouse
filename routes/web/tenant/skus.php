<?php

use App\Http\Controllers\Tenant\SkusController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    // Export Routes
    Route::post('/skus/export/pdf', [SkusController::class, 'exportPdf'])
        ->middleware('permission:tenant.skus.export')
        ->name('tenant.inventory.skus.export.pdf');

    Route::post('/skus/export/excel', [SkusController::class, 'exportExcel'])
        ->middleware('permission:tenant.skus.export')
        ->name('tenant.inventory.skus.export.excel');

    // Resource CRUD Routes
    Route::get('/skus', [SkusController::class, 'index'])
        ->middleware('permission:tenant.skus.view')
        ->name('tenant.inventory.skus.index');

    Route::get('/skus/create', [SkusController::class, 'create'])
        ->middleware('permission:tenant.skus.create')
        ->name('tenant.inventory.skus.create');

    Route::post('/skus', [SkusController::class, 'store'])
        ->middleware('permission:tenant.skus.create')
        ->name('tenant.inventory.skus.store');

    Route::get('/skus/{sku}', [SkusController::class, 'show'])
        ->middleware('permission:tenant.skus.show')
        ->name('tenant.inventory.skus.show');

    Route::get('/skus/{sku}/edit', [SkusController::class, 'edit'])
        ->middleware('permission:tenant.skus.edit')
        ->name('tenant.inventory.skus.edit');

    Route::put('/skus/{sku}', [SkusController::class, 'update'])
        ->middleware('permission:tenant.skus.edit')
        ->name('tenant.inventory.skus.update');

    Route::delete('/skus/{sku}', [SkusController::class, 'destroy'])
        ->middleware('permission:tenant.skus.delete')
        ->name('tenant.inventory.skus.destroy');
});
