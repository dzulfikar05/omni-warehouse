<?php

use App\Http\Controllers\Admin\TenantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin/tenants')->name('admin.tenants.')->group(function () {
    Route::get('/', [TenantController::class, 'index'])->middleware('permission:central.tenants.view')->name('index');
    Route::post('/', [TenantController::class, 'store'])->middleware('permission:central.tenants.create')->name('store');
    Route::put('/{tenant}', [TenantController::class, 'update'])->middleware('permission:central.tenants.edit')->name('update');
    Route::delete('/{tenant}', [TenantController::class, 'destroy'])->middleware('permission:central.tenants.delete')->name('destroy');
});
