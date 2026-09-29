<?php

use App\Http\Controllers\Tenant\InboundOutboundReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/reports')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/inbound-outbound', InboundOutboundReportController::class)
        ->middleware('permission:tenant.inbound_outbound.view')
        ->name('tenant.reports.inbound-outbound');
});
