<?php

use App\Http\Controllers\Tenant\StockMovementReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/stock-movement', [StockMovementReportController::class, 'index'])
        ->middleware('permission:tenant.stock_movement.view')
        ->name('tenant.reports.stock-movement');

    Route::post('/stock-movement/export/pdf', [StockMovementReportController::class, 'exportPdf'])
        ->middleware('permission:tenant.stock_movement.export')
        ->name('tenant.reports.stock-movement.export.pdf');

    Route::post('/stock-movement/export/excel', [StockMovementReportController::class, 'exportExcel'])
        ->middleware('permission:tenant.stock_movement.export')
        ->name('tenant.reports.stock-movement.export.excel');
});
