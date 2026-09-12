<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Tenant\AuthController as TenantAuthController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/web/users.php';
require __DIR__ . '/web/roles.php';
require __DIR__ . '/web/tenants.php';
require __DIR__ . '/settings.php';


Route::prefix('{tenant_slug}')->middleware(['identify_tenant'])->group(function () {
    // Guest Tenant Routes
    Route::get('/login', [TenantAuthController::class, 'showLoginForm'])->name('tenant.login');
    Route::post('/login', [TenantAuthController::class, 'login']);

    // Authenticated Tenant Routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::post('/logout', [TenantAuthController::class, 'logout'])->name('tenant.logout');

        Route::get('/dashboard', function () {
            return inertia('Tenant/Dashboard', [
                'tenant' => app('current_tenant'),
            ]);
        })->name('tenant.dashboard');
    });
});
