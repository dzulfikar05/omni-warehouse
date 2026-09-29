<?php

use App\Http\Controllers\Tenant\StockTransferController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/transactions/stock-transfer', [StockTransferController::class, 'index'])
        ->middleware('permission:tenant.stock_transfer.view')
        ->name('tenant.transactions.stock_transfer.index');

    Route::post('/transactions/stock-transfer', [StockTransferController::class, 'store'])
        ->middleware('permission:tenant.stock_transfer.create')
        ->name('tenant.transactions.stock_transfer.store');
});
