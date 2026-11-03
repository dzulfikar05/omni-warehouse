<?php

use App\Http\Controllers\Tenant\OutboundController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::prefix('transactions/outbound')->name('tenant.transactions.outbound.')->group(function () {

        Route::get('/', [OutboundController::class, 'index'])
            ->middleware('permission:tenant.outbound.view')
            ->name('index');

        Route::post('/', [OutboundController::class, 'store'])
            ->middleware('permission:tenant.outbound.create')
            ->name('store');

        Route::get('/{manifest_code}', [OutboundController::class, 'show'])
            ->middleware('permission:tenant.outbound.show')
            ->name('show');

        Route::post('/verify-barcode', [OutboundController::class, 'verifyBarcode'])
            ->middleware('permission:tenant.outbound.edit')
            ->name('verify-barcode');

        Route::post('/update-picking', [OutboundController::class, 'updatePicking'])
            ->middleware('permission:tenant.outbound.edit')
            ->name('update-picking');

        Route::post('/packing', [OutboundController::class, 'updatePacking'])
            ->middleware('permission:tenant.outbound.edit')
            ->name('update-packing');

        Route::post('/commit', [OutboundController::class, 'commit'])
            ->middleware('permission:tenant.outbound.commit')
            ->name('commit');

        Route::post('/hold', [OutboundController::class, 'hold'])
            ->middleware('permission:tenant.outbound.hold')
            ->name('hold');

        Route::post('/resume', [OutboundController::class, 'resume'])
            ->middleware('permission:tenant.outbound.hold')
            ->name('resume');
    });
});
