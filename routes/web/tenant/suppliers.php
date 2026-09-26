<?php

use App\Http\Controllers\Tenant\SupplierController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/contacts')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/suppliers', [SupplierController::class, 'index'])
        ->middleware('permission:contacts.suppliers.view')
        ->name('tenant.contacts.suppliers.index');

    Route::get('/suppliers/create', [SupplierController::class, 'create'])
        ->middleware('permission:contacts.suppliers.create')
        ->name('tenant.contacts.suppliers.create');

    Route::post('/suppliers', [SupplierController::class, 'store'])
        ->middleware('permission:contacts.suppliers.create')
        ->name('tenant.contacts.suppliers.store');

    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])
        ->middleware('permission:contacts.suppliers.show')
        ->name('tenant.contacts.suppliers.show');

    Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])
        ->middleware('permission:contacts.suppliers.edit')
        ->name('tenant.contacts.suppliers.edit');

    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])
        ->middleware('permission:contacts.suppliers.edit')
        ->name('tenant.contacts.suppliers.update');

    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])
        ->middleware('permission:contacts.suppliers.delete')
        ->name('tenant.contacts.suppliers.destroy');
});
