<?php

use App\Http\Controllers\Tenant\ProductsController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/products', [ProductsController::class, 'index'])
        ->name('tenant.inventory.products.index');

    Route::get('/products/create', [ProductsController::class, 'create'])
        ->name('tenant.inventory.products.create');

    Route::post('/products', [ProductsController::class, 'store'])
        ->name('tenant.inventory.products.store');

    Route::get('/products/{product}', [ProductsController::class, 'show'])
        ->name('tenant.inventory.products.show');

    Route::get('/products/{product}/edit', [ProductsController::class, 'edit'])
        ->name('tenant.inventory.products.edit');

    Route::put('/products/{product}', [ProductsController::class, 'update'])
        ->name('tenant.inventory.products.update');

    Route::delete('/products/{product}', [ProductsController::class, 'destroy'])
        ->name('tenant.inventory.products.destroy');

});