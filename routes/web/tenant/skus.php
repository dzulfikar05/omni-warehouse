<?php

use App\Http\Controllers\Tenant\SkusController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/skus', [SkusController::class, 'index'])
        ->name('tenant.inventory.skus.index');

    Route::get('/skus/create', [SkusController::class, 'create'])
        ->name('tenant.inventory.skus.create');

    Route::post('/skus', [SkusController::class, 'store'])
        ->name('tenant.inventory.skus.store');

    Route::get('/skus/{sku}', [SkusController::class, 'show'])
        ->name('tenant.inventory.skus.show');

    Route::get('/skus/{sku}/edit', [SkusController::class, 'edit'])
        ->name('tenant.inventory.skus.edit');

    Route::put('/skus/{sku}', [SkusController::class, 'update'])
        ->name('tenant.inventory.skus.update');

    Route::delete('/skus/{sku}', [SkusController::class, 'destroy'])
        ->name('tenant.inventory.skus.destroy');

});