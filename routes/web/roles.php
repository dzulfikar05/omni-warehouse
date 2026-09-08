<?php

use App\Http\Controllers\Web\RoleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('roles')->name('roles.')->group(function () {
    Route::get('/', [RoleController::class, 'index'])->middleware('permission:roles.view')->name('index');
    Route::get('/create', [RoleController::class, 'create'])->middleware('permission:roles.create')->name('create');
    Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.create')->name('store');
    Route::get('/{user}', [RoleController::class, 'show'])->middleware('permission:roles.show')->name('show');
    Route::get('/{user}/edit', [RoleController::class, 'edit'])->middleware('permission:roles.edit')->name('edit');
    Route::put('/{user}', [RoleController::class, 'update'])->middleware('permission:roles.edit')->name('update');
    Route::delete('/{user}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete')->name('destroy');
});
