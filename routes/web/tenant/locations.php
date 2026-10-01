<?php

use App\Http\Controllers\Tenant\LocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/locations', [LocationController::class, 'index'])
        ->middleware('permission:tenant.stock_locations.view')
        ->name('tenant.locations.index');

    Route::get('/stock-locations', [LocationController::class, 'index'])
        ->middleware('permission:tenant.stock_locations.view');

    Route::get('/locations/{location}', [LocationController::class, 'show'])
        ->middleware('permission:tenant.stock_locations.view')
        ->name('tenant.locations.show');

    Route::get('/stock-locations/{location}', [LocationController::class, 'show'])
        ->middleware('permission:tenant.stock_locations.view');

    Route::post('/locations', [LocationController::class, 'store'])
        ->middleware('permission:tenant.stock_locations.create')
        ->name('tenant.locations.store');

    Route::post('/stock-locations', [LocationController::class, 'store'])
        ->middleware('permission:tenant.stock_locations.create');

    Route::put('/locations/{location}', [LocationController::class, 'update'])
        ->middleware('permission:tenant.stock_locations.edit')
        ->name('tenant.locations.update');

    Route::put('/stock-locations/{location}', [LocationController::class, 'update'])
        ->middleware('permission:tenant.stock_locations.edit');

    Route::delete('/locations/{location}', [LocationController::class, 'destroy'])
        ->middleware('permission:tenant.stock_locations.delete')
        ->name('tenant.locations.destroy');

    Route::delete('/stock-locations/{location}', [LocationController::class, 'destroy'])
        ->middleware('permission:tenant.stock_locations.delete');

    // JSON endpoint for rack contents drawer
    Route::get('/locations/{location_id}/contents', [LocationController::class, 'contents'])
        ->middleware('permission:tenant.stock_locations.view')
        ->name('tenant.locations.contents');

    Route::get('/stock-locations/{location_id}/contents', [LocationController::class, 'contents'])
        ->middleware('permission:tenant.stock_locations.view');
});

