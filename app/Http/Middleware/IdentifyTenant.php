<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenantSlug = $request->route('tenant_slug');
        $tenant = null;

        if ($tenantSlug) {
            $tenant = Tenant::with(['subscription.plan'])->where('slug', $tenantSlug)->first();
        } elseif (auth()->check() && auth()->user()->tenant_id) {
            $tenant = auth()->user()->tenant;
        }

        if (! $tenant && $tenantSlug) {
            abort(404, 'Tenant account not found.');
        }

        if ($tenant) {
            app()->instance('current_tenant', $tenant);
        }

        return $next($request);
    }
}
