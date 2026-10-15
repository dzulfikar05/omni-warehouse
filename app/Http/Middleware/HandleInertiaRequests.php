<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $tenant = app()->bound('current_tenant') ? app('current_tenant') : $user?->tenant;

        // Ambil General Settings (Key-Value)
        $settings = [];
        if ($tenant) {
            $settings = DB::table('general_settings')
                ->where('tenant_id', $tenant->id)
                ->pluck('value', 'name')
                ->toArray();
        }

        // Ambil URL Logo Spatie / Fallback
        $logoUrl = null;
        if ($tenant) {
            $logoUrl = method_exists($tenant, 'getFirstMediaUrl') && $tenant->getFirstMediaUrl('logo')
                ? $tenant->getFirstMediaUrl('logo')
                : $tenant->logo;
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'tenant_id' => $user->tenant_id,
                    'tax_number' => $user->tenant?->tax_number,
                    'tenant_name' => $user->tenant?->name,
                    'logo' => $logoUrl,
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                    'roles' => $user->getRoleNames(),
                ] : null,
            ],
            'current_tenant' => $tenant ? array_merge($tenant->toArray(), [
                'logo_url' => $logoUrl,
            ]) : null,
            'settings' => $settings, // Di-share global untuk AppSidebar & Komponen lainnya
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appearance' => $request->cookie('appearance') ?? 'system',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
