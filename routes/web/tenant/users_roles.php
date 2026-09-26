<?php

use App\Http\Controllers\Tenant\TenantUserRoleController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/settings')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    // Main Index Page (Tab Members & Roles)
    Route::get('/users-roles', [TenantUserRoleController::class, 'index'])
        ->middleware('permission:tenant.users.view')
        ->name('tenant.settings.users-roles');

    // Users Management
    Route::get('/users/create', [TenantUserRoleController::class, 'createUser'])
        ->middleware('permission:tenant.users.create')
        ->name('tenant.settings.users.create');

    Route::post('/users', [TenantUserRoleController::class, 'storeUser'])
        ->middleware('permission:tenant.users.create')
        ->name('tenant.settings.users.store');

    Route::get('/users/{user}', [TenantUserRoleController::class, 'showUser'])
        ->middleware('permission:tenant.users.show')
        ->name('tenant.settings.users.show');

    Route::get('/users/{user}/edit', [TenantUserRoleController::class, 'editUser'])
        ->middleware('permission:tenant.users.edit')
        ->name('tenant.settings.users.edit');

    Route::put('/users/{user}', [TenantUserRoleController::class, 'updateUser'])
        ->middleware('permission:tenant.users.edit')
        ->name('tenant.settings.users.update');

    Route::delete('/users/{user}', [TenantUserRoleController::class, 'destroyUser'])
        ->middleware('permission:tenant.users.delete')
        ->name('tenant.settings.users.destroy');

    // Roles Management
    Route::get('/roles/create', [TenantUserRoleController::class, 'createRole'])
        ->middleware('permission:tenant.roles.create')
        ->name('tenant.settings.roles.create');

    Route::post('/roles', [TenantUserRoleController::class, 'storeRole'])
        ->middleware('permission:tenant.roles.create')
        ->name('tenant.settings.roles.store');

    Route::get('/roles/{role}', [TenantUserRoleController::class, 'showRole'])
        ->middleware('permission:tenant.roles.show')
        ->name('tenant.settings.roles.show');

    Route::get('/roles/{role}/edit', [TenantUserRoleController::class, 'editRole'])
        ->middleware('permission:tenant.roles.edit')
        ->name('tenant.settings.roles.edit');

    Route::put('/roles/{role}', [TenantUserRoleController::class, 'updateRole'])
        ->middleware('permission:tenant.roles.edit')
        ->name('tenant.settings.roles.update');

    Route::delete('/roles/{role}', [TenantUserRoleController::class, 'destroyRole'])
        ->middleware('permission:tenant.roles.delete')
        ->name('tenant.settings.roles.destroy');
});
