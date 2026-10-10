<?php

use App\Http\Controllers\Tenant\SupplierController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/contacts')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    // 1. ROUTE SPESIFIK & EXPORT (HARUS DITARUH DI ATAS BARIS WILDCARD)
    Route::get('/suppliers/export-logs', [SupplierController::class, 'getExportNotifications'])
        ->name('tenant.contacts.suppliers.export.logs');

    Route::post('/suppliers/export/pdf', [SupplierController::class, 'exportPdf'])
        ->middleware('permission:tenant.contacts.suppliers.export')
        ->name('tenant.contacts.suppliers.export.pdf');

    Route::post('/suppliers/export/excel', [SupplierController::class, 'exportExcel'])
        ->middleware('permission:tenant.contacts.suppliers.export')
        ->name('tenant.contacts.suppliers.export.excel');

    // 2. ROUTE LIST & CREATE
    Route::get('/suppliers', [SupplierController::class, 'index'])
        ->middleware('permission:tenant.contacts.suppliers.view')
        ->name('tenant.contacts.suppliers.index');

    Route::get('/suppliers/create', [SupplierController::class, 'create'])
        ->middleware('permission:tenant.contacts.suppliers.create')
        ->name('tenant.contacts.suppliers.create');

    Route::post('/suppliers', [SupplierController::class, 'store'])
        ->middleware('permission:tenant.contacts.suppliers.create')
        ->name('tenant.contacts.suppliers.store');

    // 3. ROUTE WILDCARD {supplier} (HARUS DITARUH DI BAWAH ROUTE SPESIFIK)
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])
        ->middleware('permission:tenant.contacts.suppliers.show')
        ->name('tenant.contacts.suppliers.show');

    Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])
        ->middleware('permission:tenant.contacts.suppliers.edit')
        ->name('tenant.contacts.suppliers.edit');

    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])
        ->middleware('permission:tenant.contacts.suppliers.update')
        ->name('tenant.contacts.suppliers.update');

    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])
        ->middleware('permission:tenant.contacts.suppliers.delete')
        ->name('tenant.contacts.suppliers.destroy');

});
