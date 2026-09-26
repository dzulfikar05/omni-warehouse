<?php

use App\Http\Controllers\Tenant\OutboundController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/transactions/outbound', [OutboundController::class, 'index'])
        ->middleware('permission:outbound.view')
        ->name('tenant.transactions.outbound.index');

    Route::get('/transactions/outbound/{manifest_code}', [OutboundController::class, 'show'])
        ->middleware('permission:outbound.view')
        ->name('tenant.transactions.outbound.show');

    Route::post('/transactions/outbound/verify-barcode', [OutboundController::class, 'verifyBarcode'])
        ->middleware('permission:outbound.edit')
        ->name('tenant.transactions.outbound.verify-barcode');

    Route::post('/transactions/outbound/packing', [OutboundController::class, 'updatePacking'])
        ->middleware('permission:outbound.edit')
        ->name('tenant.transactions.outbound.update-packing');

    Route::post('/transactions/outbound/commit', [OutboundController::class, 'commit'])
        ->middleware('permission:outbound.commit')
        ->name('tenant.transactions.outbound.commit');

    Route::post('/transactions/outbound/hold', [OutboundController::class, 'hold'])
        ->middleware('permission:outbound.edit')
        ->name('tenant.transactions.outbound.hold');
});
