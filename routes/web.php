<?php

use App\Http\Controllers\Tenant\AuthController as TenantAuthController;
use App\Http\Middleware\EnsureCentralUser;
use App\Models\Plan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public / Guest Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    $plans = Plan::with('features')->where('is_active', true)->orderBy('price', 'asc')->get();
    return inertia('welcome', [
        'plans' => $plans,
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/register-tenant', [TenantAuthController::class, 'showRegisterForm'])->name('tenant.register');
Route::post('/register-tenant', [TenantAuthController::class, 'register']);


/*
|--------------------------------------------------------------------------
| Central / Platform Admin Routes (Protected with EnsureCentralUser)
|--------------------------------------------------------------------------
| Semua route central membutuhkan autentikasi DAN memastikan user adalah
| Super Admin / Central User (tenant_id == null).
*/
Route::middleware(['auth', 'verified', EnsureCentralUser::class])->group(function () {
    // Central Dashboard
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Central Admin Modules
    require __DIR__ . '/web/users.php';
    require __DIR__ . '/web/roles.php';
    require __DIR__ . '/web/tenants.php';
    require __DIR__ . '/web/plans.php';
    require __DIR__ . '/settings.php';
});


/*
|--------------------------------------------------------------------------
| Tenant Required Sub-files (Loaded globally or routed via prefix)
|--------------------------------------------------------------------------
*/
require __DIR__ . '/web/tenant/users_roles.php';
require __DIR__ . '/web/tenant/company_profile.php';
require __DIR__ . '/web/tenant/stock_opname.php';
require __DIR__ . '/web/tenant/customers.php';
require __DIR__ . '/web/tenant/suppliers.php';


/*
|--------------------------------------------------------------------------
| Tenant Workspace Routes (Isolated by tenant_slug)
|--------------------------------------------------------------------------
*/
Route::prefix('{tenant_slug}')->middleware(['identify_tenant'])->group(function () {
    Route::get('/', [TenantAuthController::class, 'showTenantWelcome'])->name('tenant.welcome');

    // Guest Tenant Routes
    Route::get('/login', [TenantAuthController::class, 'showLoginForm'])->name('tenant.login');
    Route::post('/login', [TenantAuthController::class, 'login']);

    // Authenticated Tenant Routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::post('/logout', [TenantAuthController::class, 'logout'])->name('tenant.logout');

        Route::get('/dashboard', function () {
            return Inertia::render('Tenant/Dashboard');
        })->name('tenant.dashboard');

        require __DIR__ . '/web/tenant/settings.php';

    });
});
