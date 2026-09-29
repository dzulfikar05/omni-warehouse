<?php

use App\Http\Controllers\Tenant\ValuationAssetReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/valuation-asset', ValuationAssetReportController::class)
        ->middleware('permission:tenant.valuation_asset.view')
        ->name('tenant.reports.valuation-asset');
});
