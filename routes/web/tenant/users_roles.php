<?php

use App\Http\Controllers\Tenant\TenantUserRoleController;
use Illuminate\Support\Facades\Route;

Route::prefix('{tenant_slug}/settings')->middleware(['identify_tenant', 'auth', 'verified'])->group(function () {
    // Main Index Page (Tab Members & Roles)
    Route::get('/users-roles', [TenantUserRoleController::class, 'index'])->name('tenant.settings.users-roles');

    // Users CRUD
    Route::get('/users/create', [TenantUserRoleController::class, 'createUser'])->name('tenant.settings.users.create');
    Route::post('/users', [TenantUserRoleController::class, 'storeUser'])->name('tenant.settings.users.store');
    Route::get('/users/{user}', [TenantUserRoleController::class, 'showUser'])->name('tenant.settings.users.show');
    Route::get('/users/{user}/edit', [TenantUserRoleController::class, 'editUser'])->name('tenant.settings.users.edit');
    Route::put('/users/{user}', [TenantUserRoleController::class, 'updateUser'])->name('tenant.settings.users.update');
    Route::delete('/users/{user}', [TenantUserRoleController::class, 'destroyUser'])->name('tenant.settings.users.destroy');

    // Roles CRUD
    Route::get('/roles/create', [TenantUserRoleController::class, 'createRole'])->name('tenant.settings.roles.create');
    Route::post('/roles', [TenantUserRoleController::class, 'storeRole'])->name('tenant.settings.roles.store');
    Route::get('/roles/{role}', [TenantUserRoleController::class, 'showRole'])->name('tenant.settings.roles.show');
    Route::get('/roles/{role}/edit', [TenantUserRoleController::class, 'editRole'])->name('tenant.settings.roles.edit');
    Route::put('/roles/{role}', [TenantUserRoleController::class, 'updateRole'])->name('tenant.settings.roles.update');
    Route::delete('/roles/{role}', [TenantUserRoleController::class, 'destroyRole'])->name('tenant.settings.roles.destroy');
});
