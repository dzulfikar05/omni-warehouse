<?php

use App\Http\Controllers\Tenant\InboundController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/transactions/inbound', [InboundController::class, 'index'])
        ->middleware('permission:tenant.inbound.view')
        ->name('tenant.transactions.inbound.index');

    Route::get('/transactions/inbound/{manifest_code}', [InboundController::class, 'show'])
        ->middleware('permission:tenant.inbound.show')
        ->name('tenant.transactions.inbound.show');

    Route::post('/transactions/inbound/verify-barcode', [InboundController::class, 'verifyBarcode'])
        ->middleware('permission:tenant.inbound.verify_barcode')
        ->name('tenant.transactions.inbound.verify-barcode');

    Route::post('/transactions/inbound/putaway', [InboundController::class, 'updatePutaway'])
        ->middleware('permission:tenant.inbound.putaway')
        ->name('tenant.transactions.inbound.update-putaway');

    Route::post('/transactions/inbound/commit', [InboundController::class, 'commit'])
        ->middleware('permission:tenant.inbound.commit')
        ->name('tenant.transactions.inbound.commit');

    Route::post('/transactions/inbound/hold', [InboundController::class, 'hold'])
        ->middleware('permission:tenant.inbound.hold')
        ->name('tenant.transactions.inbound.hold');
});

