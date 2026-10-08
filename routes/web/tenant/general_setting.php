<?php

use App\Http\Controllers\Tenant\GeneralSettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/settings')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {

    Route::get('/general-settings', [GeneralSettingController::class, 'edit'])
        ->middleware('permission:tenant.general_settings.view')
        ->name('tenant.settings.general-settings.edit');

    Route::post('/general-settings', [GeneralSettingController::class, 'update'])
        ->middleware('permission:tenant.general_settings.edit')
        ->name('tenant.settings.general-settings.update');

    Route::put('/general-settings', [GeneralSettingController::class, 'update'])
        ->middleware('permission:tenant.general_settings.edit');
});
