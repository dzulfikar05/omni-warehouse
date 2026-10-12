<?php

use App\Http\Controllers\Tenant\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/warehouses', [WarehouseController::class, 'index'])
        ->middleware('permission:tenant.warehouses.view')
        ->name('tenant.warehouses.index');

    Route::get('/warehouses/create', [WarehouseController::class, 'create'])
        ->middleware('permission:tenant.warehouses.create')
        ->name('tenant.warehouses.create');

    Route::post('/warehouses', [WarehouseController::class, 'store'])
        ->middleware('permission:tenant.warehouses.create')
        ->name('tenant.warehouses.store');

    Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show'])
        ->middleware('permission:tenant.warehouses.show')
        ->name('tenant.warehouses.show');

    Route::get('/warehouses/{warehouse}/edit', [WarehouseController::class, 'edit'])
        ->middleware('permission:tenant.warehouses.edit')
        ->name('tenant.warehouses.edit');

    Route::put('/warehouses/{warehouse}', [WarehouseController::class, 'update'])
        ->middleware('permission:tenant.warehouses.edit')
        ->name('tenant.warehouses.update');

    Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy'])
        ->middleware('permission:tenant.warehouses.delete')
        ->name('tenant.warehouses.destroy');

    Route::post('/warehouses/export/pdf', [WarehouseController::class, 'exportPdf'])
        ->middleware('permission:tenant.warehouses.export')
        ->name('tenant.warehouses.export.pdf');

    Route::post('/warehouses/export/excel', [WarehouseController::class, 'exportExcel'])
        ->middleware('permission:tenant.warehouses.export')
        ->name('tenant.warehouses.export.excel');
});
