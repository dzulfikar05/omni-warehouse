<?php

use App\Http\Controllers\Tenant\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/warehouses', [WarehouseController::class, 'index'])->name('tenant.warehouses.index');
    Route::post('/warehouses', [WarehouseController::class, 'store'])->name('tenant.warehouses.store');
    Route::put('/warehouses/{warehouse}', [WarehouseController::class, 'update'])->name('tenant.warehouses.update');
    Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy'])->name('tenant.warehouses.destroy');
});