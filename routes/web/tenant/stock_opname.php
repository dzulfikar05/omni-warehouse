<?php

use App\Http\Controllers\Tenant\StockOpnameController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/stock-opname', [StockOpnameController::class, 'index'])->name('tenant.stock-opname.index');
    Route::post('/stock-opname/sessions', [StockOpnameController::class, 'storeSession'])->name('tenant.stock-opname.store-session');
    Route::post('/stock-opname/verify', [StockOpnameController::class, 'verifyCount'])->name('tenant.stock-opname.verify');
    Route::post('/stock-opname/adjust', [StockOpnameController::class, 'executeAdjustment'])->name('tenant.stock-opname.adjust');
});
