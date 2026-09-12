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

        $tenant = Tenant::with(['subscription.plan'])->where('slug', $tenantSlug)->first();

        if (! $tenant) {
            abort(404, 'Not Found.');
        }

        app()->instance('current_tenant', $tenant);

        return $next($request);
    }
}
