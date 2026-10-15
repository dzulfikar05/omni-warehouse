<?php

use App\Http\Controllers\Admin\PlanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
    Route::get('/plans/create', [PlanController::class, 'create'])->name('plans.create');
    Route::post('/plans', [PlanController::class, 'store'])->name('plans.store'); // <-- Tambahkan ini untuk simpan create plan
    Route::get('/plans/{id}/edit', [PlanController::class, 'edit'])->name('plans.edit');
    Route::put('/plans/{id}', [PlanController::class, 'update'])->name('plans.update'); // <-- Tambahkan ini untuk update plan
    Route::delete('/plans/{id}', [PlanController::class, 'destroy'])->name('plans.destroy'); // <-- Tambahkan ini untuk hapus plan
});