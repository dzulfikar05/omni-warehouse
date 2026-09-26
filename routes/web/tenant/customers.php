<?php

use App\Http\Controllers\Tenant\CustomerController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/contacts')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/customers', [CustomerController::class, 'index'])
        ->middleware('permission:tenant.contacts.customers.view')
        ->name('tenant.contacts.customers.index');

    Route::get('/customers/create', [CustomerController::class, 'create'])
        ->middleware('permission:tenant.contacts.customers.create')
        ->name('tenant.contacts.customers.create');

    Route::post('/customers', [CustomerController::class, 'store'])
        ->middleware('permission:tenant.contacts.customers.create')
        ->name('tenant.contacts.customers.store');

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
