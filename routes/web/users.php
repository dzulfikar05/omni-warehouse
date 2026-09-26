<?php

use App\Http\Controllers\Web\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware('permission:central.users.view')->name('index');
    Route::get('/create', [UserController::class, 'create'])->middleware('permission:central.users.create')->name('create');
    Route::post('/', [UserController::class, 'store'])->middleware('permission:central.users.create')->name('store');
    Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:central.users.show')->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->middleware('permission:central.users.edit')->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:central.users.edit')->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:central.users.delete')->name('destroy');
});
