<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCentralUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->tenant_id !== null) {
            $tenantSlug = auth()->user()->tenant->slug ?? null;

            if ($tenantSlug) {
                return redirect()->to("/{$tenantSlug}/dashboard")
                    ->with('error', 'Tenant account cannot access central panel.');
            }

            abort(403, 'Access denied.');
        }

        return $next($request);
    }
}
