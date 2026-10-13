<?php

use App\Http\Controllers\Tenant\LocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    // ----------------------------------------------------
    // 1. RUTE UTAMA: /locations
    // ----------------------------------------------------
    Route::get('/locations', [LocationController::class, 'index'])
        ->middleware('permission:tenant.locations.view')
        ->name('tenant.locations.index');

    Route::get('/locations/create', [LocationController::class, 'create'])
        ->middleware('permission:tenant.locations.create')
        ->name('tenant.locations.create');

    Route::post('/locations', [LocationController::class, 'store'])
        ->middleware('permission:tenant.locations.create')
        ->name('tenant.locations.store');

    Route::get('/locations/{location}', [LocationController::class, 'show'])
        ->middleware('permission:tenant.locations.show')
        ->name('tenant.locations.show');

    Route::get('/locations/{location}/edit', [LocationController::class, 'edit'])
        ->middleware('permission:tenant.locations.edit')
        ->name('tenant.locations.edit');

    Route::put('/locations/{location}', [LocationController::class, 'update'])
        ->middleware('permission:tenant.locations.edit')
        ->name('tenant.locations.update');

    Route::delete('/locations/{location}', [LocationController::class, 'destroy'])
        ->middleware('permission:tenant.locations.delete')
        ->name('tenant.locations.destroy');

    Route::get('/locations/{location_id}/contents', [LocationController::class, 'contents'])
        ->middleware('permission:tenant.locations.show')
        ->name('tenant.locations.contents');

    Route::post('/locations/export/pdf', [LocationController::class, 'exportPdf'])
        ->middleware('permission:tenant.locations.export')
        ->name('tenant.locations.export.pdf');

    Route::post('/locations/export/excel', [LocationController::class, 'exportExcel'])
        ->middleware('permission:tenant.locations.export')
        ->name('tenant.locations.export.excel');

    // ----------------------------------------------------
    // 2. RUTE ALIAS: /stock-locations
    // ----------------------------------------------------
    Route::get('/stock-locations', [LocationController::class, 'index'])
        ->middleware('permission:tenant.stock_locations.view')
        ->name('tenant.stock_locations.index');

    Route::get('/stock-locations/create', [LocationController::class, 'create'])
        ->middleware('permission:tenant.stock_locations.create')
        ->name('tenant.stock_locations.create');

    Route::post('/stock-locations', [LocationController::class, 'store'])
        ->middleware('permission:tenant.stock_locations.create')
        ->name('tenant.stock_locations.store');

    Route::get('/stock-locations/{location}', [LocationController::class, 'show'])
        ->middleware('permission:tenant.stock_locations.show')
        ->name('tenant.stock_locations.show');

    Route::get('/stock-locations/{location}/edit', [LocationController::class, 'edit'])
        ->middleware('permission:tenant.stock_locations.edit')
        ->name('tenant.stock_locations.edit');

    Route::put('/stock-locations/{location}', [LocationController::class, 'update'])
        ->middleware('permission:tenant.stock_locations.edit')
        ->name('tenant.stock_locations.update');

    Route::delete('/stock-locations/{location}', [LocationController::class, 'destroy'])
        ->middleware('permission:tenant.stock_locations.delete')
        ->name('tenant.stock_locations.destroy');

    Route::get('/stock-locations/{location_id}/contents', [LocationController::class, 'contents'])
        ->middleware('permission:tenant.stock_locations.show')
        ->name('tenant.stock_locations.contents');

    Route::post('/stock-locations/export/pdf', [LocationController::class, 'exportPdf'])
        ->middleware('permission:tenant.stock_locations.export')
        ->name('tenant.stock_locations.export.pdf');

    Route::post('/stock-locations/export/excel', [LocationController::class, 'exportExcel'])
        ->middleware('permission:tenant.stock_locations.export')
        ->name('tenant.stock_locations.export.excel');
});
