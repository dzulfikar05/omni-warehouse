<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\PaymentController;
use App\Http\Controllers\Settings\PaymentSettingController;

use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
    
    Route::post('settings/payment/create-link', [PaymentController::class, 'createPaymentLink'])->name('tenant.payment.create');

    Route::get('settings/payment', [PaymentSettingController::class, 'edit'])->name('payment.edit');
    Route::put('settings/payment', [PaymentSettingController::class, 'update'])->name('payment.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    
    Route::inertia('settings/language', 'settings/language')->name('language.edit');
});