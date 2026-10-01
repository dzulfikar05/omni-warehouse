<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'identify_tenant' => \App\Http\Middleware\IdentifyTenant::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // bootstrap/app.php

        $middleware->redirectGuestsTo(function (Request $request) {
            // Ambil segment pertama dari path URL (misal: 'demo-tenant' dari 'demo-tenant/dashboard')
            $tenantSlug = $request->route('tenant_slug') ?? $request->segment(1);

            // Jika ada tenant_slug dan bukan akses ke halaman login itu sendiri
            if ($tenantSlug && !in_array($tenantSlug, ['login', 'register-tenant'])) {
                return route('tenant.login', ['tenant_slug' => $tenantSlug]);
            }

            return route('tenant.login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
