<?php

use App\Http\Controllers\Tenant\InboundOutboundReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/inbound-outbound', [InboundOutboundReportController::class, 'index'])
        ->middleware('permission:tenant.inbound_outbound.view')
        ->name('tenant.reports.inbound-outbound');

    Route::post('/inbound-outbound/export/pdf', [InboundOutboundReportController::class, 'exportPdf'])
        ->middleware('permission:tenant.inbound_outbound.export')
        ->name('tenant.reports.inbound-outbound.export.pdf');

    Route::post('/inbound-outbound/export/excel', [InboundOutboundReportController::class, 'exportExcel'])
        ->middleware('permission:tenant.inbound_outbound.export')
        ->name('tenant.reports.inbound-outbound.export.excel');
});
