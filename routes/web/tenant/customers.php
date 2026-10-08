<?php

use App\Http\Controllers\Tenant\CustomerController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/contacts')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    // 1. ROUTE SPESIFIK & EXPORT (HARUS DITARUH DI ATAS)
    Route::get('/customers/export-logs', [CustomerController::class, 'getExportNotifications'])
        ->name('tenant.contacts.customers.export.logs');

    Route::post('/customers/export/pdf', [CustomerController::class, 'exportPdf'])
        ->middleware('permission:tenant.contacts.customers.export')
        ->name('tenant.contacts.customers.export.pdf');

    Route::post('/customers/export/excel', [CustomerController::class, 'exportExcel'])
        ->middleware('permission:tenant.contacts.customers.export')
        ->name('tenant.contacts.customers.export.excel');

    // 2. ROUTE LIST & CREATE
    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('permission:tenant.contacts.customers.view')
        ->name('tenant.contacts.customers.index');

    Route::get('/customers/create', [CustomerController::class, 'create'])
        ->middleware('permission:tenant.contacts.customers.create')
        ->name('tenant.contacts.customers.create');

    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('permission:tenant.contacts.customers.create')
        ->name('tenant.contacts.customers.store');

    // 3. ROUTE WILDCARD {customer} (HARUS DITARUH DI BAWAH ROUTE SPESIFIK)
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])
        ->middleware('permission:tenant.contacts.customers.show')
        ->name('tenant.contacts.customers.show');

    Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])
        ->middleware('permission:tenant.contacts.customers.edit')
        ->name('tenant.contacts.customers.edit');

    Route::put('/customers/{customer}', [CustomerController::class, 'update'])
        ->middleware('permission:tenant.contacts.customers.update')
        ->name('tenant.contacts.customers.update');

    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
        ->middleware('permission:tenant.contacts.customers.delete')
        ->name('tenant.contacts.customers.destroy');

});
