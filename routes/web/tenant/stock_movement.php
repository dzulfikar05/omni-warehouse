<?php

use App\Http\Controllers\Tenant\StockMovementReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/stock-movement', StockMovementReportController::class)
        ->middleware('permission:tenant.stock_movement.view')
        ->name('tenant.reports.stock-movement');
});
