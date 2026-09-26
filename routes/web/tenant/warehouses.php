<?php

use App\Http\Controllers\Tenant\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/warehouses', [WarehouseController::class, 'index'])
        ->middleware('permission:tenant.warehouses.view')
        ->name('tenant.warehouses.index');

    Route::post('/warehouses', [WarehouseController::class, 'store'])
        ->middleware('permission:tenant.warehouses.create')
        ->name('tenant.warehouses.store');

    Route::put('/warehouses/{warehouse}', [WarehouseController::class, 'update'])
        ->middleware('permission:tenant.warehouses.edit')
        ->name('tenant.warehouses.update');

    Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy'])
        ->middleware('permission:tenant.warehouses.delete')
        ->name('tenant.warehouses.destroy');
});
