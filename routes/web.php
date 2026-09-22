<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Tenant\AuthController as TenantAuthController;
use App\Models\Plan;
use Inertia\Inertia;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/', function () {
    $plans = Plan::with('features')->where('is_active', true)->orderBy('price', 'asc')->get();
    return inertia('welcome', ['plans' => $plans]);
})->name('home');

Route::get('/register-tenant', [TenantAuthController::class, 'showRegisterForm'])->name('tenant.register');
Route::post('/register-tenant', [TenantAuthController::class, 'register']);

require __DIR__ . '/web/users.php';
require __DIR__ . '/web/roles.php';
require __DIR__ . '/web/tenants.php';
require __DIR__ . '/web/plans.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/web/tenant/users_roles.php';
require __DIR__ . '/web/tenant/company_profile.php';


Route::prefix('{tenant_slug}')->middleware(['identify_tenant'])->group(function () {
    Route::get('/', [TenantAuthController::class, 'showTenantWelcome'])->name('tenant.welcome');
    // Guest Routes
    Route::get('/login', [TenantAuthController::class, 'showLoginForm'])->name('tenant.login');
    Route::post('/login', [TenantAuthController::class, 'login']);

    // Authenticated Tenant Routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::post('/logout', [TenantAuthController::class, 'logout'])->name('tenant.logout');

        Route::get('/dashboard', function () {
            return Inertia::render('Tenant/Dashboard');
        })->name('tenant.dashboard');
    });
});
