<?php

use App\Http\Controllers\Admin\TenantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin/tenants')->name('admin.tenants.')->group(function () {
    
    Route::get('/', [TenantController::class, 'index'])->middleware('permission:central.tenants.view')->name('index');
    Route::get('/create', [TenantController::class, 'create'])->middleware('permission:central.tenants.create')->name('create');
    Route::post('/', [TenantController::class, 'store'])->middleware('permission:central.tenants.create')->name('store');
    Route::get('/{tenant}', [TenantController::class, 'show'])->middleware('permission:central.tenants.view')->name('show');
    Route::get('/{tenant}/edit', [TenantController::class, 'edit'])->middleware('permission:central.tenants.edit')->name('edit');
    Route::put('/{tenant}', [TenantController::class, 'update'])->middleware('permission:central.tenants.edit')->name('update');
    Route::delete('/{tenant}', [TenantController::class, 'destroy'])->middleware('permission:central.tenants.delete')->name('destroy');

});