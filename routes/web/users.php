<?php

use App\Http\Controllers\Web\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('users')->name('users.')->group(function () {
    Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view')->name('index');
    Route::get('/create', [UserController::class, 'create'])->middleware('permission:users.create')->name('create');
    Route::post('/', [UserController::class, 'store'])->middleware('permission:users.create')->name('store');
    Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:users.show')->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->middleware('permission:users.edit')->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:users.edit')->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete')->name('destroy');
});
