<?php

use App\Http\Controllers\Tenant\Settings\ProfileController;
use App\Http\Controllers\Tenant\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::redirect('settings', 'settings/profile');

Route::get('settings/profile', [ProfileController::class, 'edit'])->name('tenant.profile.edit');
Route::patch('settings/profile', [ProfileController::class, 'update'])->name('tenant.profile.update');
Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('tenant.profile.destroy');

Route::get('settings/security', [SecurityController::class, 'edit'])->name('tenant.security.edit');
Route::put('settings/password', [SecurityController::class, 'update'])->name('tenant.password.update');

Route::inertia('settings/appearance', 'Tenant/Settings/Appearance')->name('tenant.appearance.edit');
