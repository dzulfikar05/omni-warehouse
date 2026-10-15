<?php

use App\Http\Controllers\Tenant\ProductsController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::post('/products/export/pdf', [ProductsController::class, 'exportPdf'])
        ->name('tenant.inventory.products.export.pdf')
        ->middleware('permission:tenant.products.export');

    Route::post('/products/export/excel', [ProductsController::class, 'exportExcel'])
        ->name('tenant.inventory.products.export.excel')
        ->middleware('permission:tenant.products.export');

    Route::get('/products', [ProductsController::class, 'index'])
        ->name('tenant.inventory.products.index')
        ->middleware('permission:tenant.products.view');

    Route::get('/products/create', [ProductsController::class, 'create'])
        ->name('tenant.inventory.products.create')
        ->middleware('permission:tenant.products.create');

    Route::post('/products', [ProductsController::class, 'store'])
        ->name('tenant.inventory.products.store')
        ->middleware('permission:tenant.products.create');

    Route::get('/products/{product}', [ProductsController::class, 'show'])
        ->name('tenant.inventory.products.show')
        ->middleware('permission:tenant.products.show');

    Route::get('/products/{product}/edit', [ProductsController::class, 'edit'])
        ->name('tenant.inventory.products.edit')
        ->middleware('permission:tenant.products.edit');

    Route::put('/products/{product}', [ProductsController::class, 'update'])
        ->name('tenant.inventory.products.update')
        ->middleware('permission:tenant.products.edit');

    Route::delete('/products/{product}', [ProductsController::class, 'destroy'])
        ->name('tenant.inventory.products.destroy')
        ->middleware('permission:tenant.products.delete');


});
