<?php

use App\Http\Controllers\Tenant\UnitsController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/units', [UnitsController::class, 'index'])
        ->name('tenant.inventory.units.index');

    Route::get('/units/create', [UnitsController::class, 'create'])
        ->name('tenant.inventory.units.create');

    Route::post('/units', [UnitsController::class, 'store'])
        ->name('tenant.inventory.units.store');

    Route::get('/units/{unit}', [UnitsController::class, 'show'])
        ->name('tenant.inventory.units.show');

    Route::get('/units/{unit}/edit', [UnitsController::class, 'edit'])
        ->name('tenant.inventory.units.edit');

    Route::put('/units/{unit}', [UnitsController::class, 'update'])
        ->name('tenant.inventory.units.update');

    Route::delete('/units/{unit}', [UnitsController::class, 'destroy'])
        ->name('tenant.inventory.units.destroy');

});