<?php

use App\Http\Controllers\Web\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('roles')->name('roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->middleware('permission:central.roles.view')->name('index');
    Route::get('/create', [RoleController::class, 'create'])->middleware('permission:central.roles.create')->name('create');
    Route::post('/', [RoleController::class, 'store'])->middleware('permission:central.roles.create')->name('store');
    Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:central.roles.show')->name('show');
    Route::get('/{role}/edit', [RoleController::class, 'edit'])->middleware('permission:central.roles.edit')->name('edit');
    Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:central.roles.edit')->name('update');
    Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:central.roles.delete')->name('destroy');
});
