<?php

use App\Http\Controllers\Tenant\StockSummaryReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/stock-summary', [StockSummaryReportController::class, 'index'])
        ->middleware('permission:tenant.stock_summary.view')
        ->name('tenant.reports.stock-summary');

    Route::post('/stock-summary/export/pdf', [StockSummaryReportController::class, 'exportPdf'])
        ->middleware('permission:tenant.stock_summary.export')
        ->name('tenant.reports.stock-summary.export.pdf');

    Route::post('/stock-summary/export/excel', [StockSummaryReportController::class, 'exportExcel'])
        ->middleware('permission:tenant.stock_summary.export')
        ->name('tenant.reports.stock-summary.export.excel');

});
