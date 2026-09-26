<?php

use App\Http\Controllers\Tenant\CompanyProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/settings')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    Route::get('/company-profile', [CompanyProfileController::class, 'edit'])
        ->middleware('permission:tenant.company_profile.view')
        ->name('tenant.settings.company-profile.edit');

    Route::post('/company-profile', [CompanyProfileController::class, 'update'])
        ->middleware('permission:tenant.company_profile.edit')
        ->name('tenant.settings.company-profile.update');

    Route::delete('/company-profile/logo', [CompanyProfileController::class, 'destroyLogo'])
        ->middleware('permission:tenant.company_profile.delete_logo')
        ->name('tenant.settings.company-profile.destroy-logo');
});
