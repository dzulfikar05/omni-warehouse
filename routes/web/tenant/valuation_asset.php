<?php

use App\Http\Controllers\Tenant\ValuationAssetReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/valuation-asset', [ValuationAssetReportController::class, 'index'])
        ->middleware('permission:tenant.valuation_asset.view')
        ->name('tenant.reports.valuation-asset');

    Route::post('/valuation-asset/export/pdf', [ValuationAssetReportController::class, 'exportPdf'])
        ->middleware('permission:tenant.valuation_asset.export')
        ->name('tenant.reports.valuation-asset.export.pdf');

    Route::post('/valuation-asset/export/excel', [ValuationAssetReportController::class, 'exportExcel'])
        ->middleware('permission:tenant.valuation_asset.export')
        ->name('tenant.reports.valuation-asset.export.excel');
});
