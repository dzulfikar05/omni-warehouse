<?php

use App\Http\Controllers\Tenant\GeneralSettingsController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/settings')->name('tenant.settings.')->group(function () {
    Route::get('/general-settings', [GeneralSettingsController::class, 'edit'])->name('general-settings.edit');
    Route::post('/general-settings', [GeneralSettingsController::class, 'update'])->name('general-settings.update');
});
