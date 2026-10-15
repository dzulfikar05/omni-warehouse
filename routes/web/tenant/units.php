<?php

use App\Http\Controllers\Tenant\UnitsController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/units', [UnitsController::class, 'index'])
        ->name('tenant.inventory.units.index')
        ->middleware('permission:tenant.units.view|units.view');

    Route::get('/units/create', [UnitsController::class, 'create'])
        ->name('tenant.inventory.units.create')
        ->middleware('permission:tenant.units.create|units.create');

    Route::post('/units', [UnitsController::class, 'store'])
        ->name('tenant.inventory.units.store')
        ->middleware('permission:tenant.units.create|units.create');

    Route::get('/units/{unit}', [UnitsController::class, 'show'])
        ->name('tenant.inventory.units.show')
        ->middleware('permission:tenant.units.show|units.show');

    Route::get('/units/{unit}/edit', [UnitsController::class, 'edit'])
        ->name('tenant.inventory.units.edit')
        ->middleware('permission:tenant.units.edit|units.edit');

    Route::put('/units/{unit}', [UnitsController::class, 'update'])
        ->name('tenant.inventory.units.update')
        ->middleware('permission:tenant.units.edit|units.edit');

    Route::delete('/units/{unit}', [UnitsController::class, 'destroy'])
        ->name('tenant.inventory.units.destroy')
        ->middleware('permission:tenant.units.delete|units.delete');

    // Export Routes
    Route::post('/units/export/pdf', [UnitsController::class, 'exportPdf'])
        ->name('tenant.inventory.units.export.pdf')
        ->middleware('permission:tenant.units.export|units.export');

    Route::post('/units/export/excel', [UnitsController::class, 'exportExcel'])
        ->name('tenant.inventory.units.export.excel')
        ->middleware('permission:tenant.units.export|units.export');

});
