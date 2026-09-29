<?php

use App\Http\Controllers\Tenant\CategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/inventory')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/categories', [CategoryController::class, 'index'])
        ->name('tenant.inventory.categories.index');

    Route::get('/categories/create', [CategoryController::class, 'create'])
        ->name('tenant.inventory.categories.create');

    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('tenant.inventory.categories.store');

    Route::get('/categories/{category}', [CategoryController::class, 'show'])
        ->name('tenant.inventory.categories.show');

    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])
        ->name('tenant.inventory.categories.edit');

    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->name('tenant.inventory.categories.update');

    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('tenant.inventory.categories.destroy');

});