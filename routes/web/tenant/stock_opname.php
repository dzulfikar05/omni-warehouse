<?php

use App\Http\Controllers\Tenant\StockOpnameController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/stock-opname', [StockOpnameController::class, 'index'])
        ->middleware('permission:tenant.stock_opname.view')
        ->name('tenant.stock-opname.index');

    Route::post('/stock-opname/sessions', [StockOpnameController::class, 'storeSession'])
        ->middleware('permission:tenant.stock_opname.create_session')
        ->name('tenant.stock-opname.store-session');

    Route::post('/stock-opname/verify', [StockOpnameController::class, 'verifyCount'])
        ->middleware('permission:tenant.stock_opname.verify')
        ->name('tenant.stock-opname.verify');

    Route::post('/stock-opname/adjust', [StockOpnameController::class, 'executeAdjustment'])
        ->middleware('permission:tenant.stock_opname.adjust')
        ->name('tenant.stock-opname.adjust');

    Route::post('/stock-opname/export/pdf', [StockOpnameController::class, 'exportPdf'])
        ->middleware('permission:tenant.stock_opname.export')
        ->name('tenant.stock-opname.export.pdf');

    Route::post('/stock-opname/export/excel', [StockOpnameController::class, 'exportExcel'])
        ->middleware('permission:tenant.stock_opname.export')
        ->name('tenant.stock-opname.export.excel');
});
