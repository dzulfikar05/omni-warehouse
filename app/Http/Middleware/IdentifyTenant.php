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

            if (! $tenant) {
                abort(404, 'Tenant account not found.');
            }

            // CEK 1: Jika user sudah login, tapi tenant_id-nya tidak sesuai dengan tenant di URL
            if (auth()->check() && auth()->user()->tenant_id !== $tenant->id) {
                // Abaikan jika user adalah Super Admin platform (tenant_id null) jika memang diizinkan
                // Jika tenant user biasa mencoba buka tenant lain, tolak akses (403)
                abort(403, 'Unauthorized access to this tenant workspace.');
            }
        } elseif (auth()->check()) {
            // CEK 2: Jika mengakses route Central/Platform (tanpa tenant_slug)
            // tapi akun yang login adalah Akun Tenant
            if (auth()->user()->tenant_id !== null) {
                // Redirect otomatis ke dashboard workspace tenant miliknya
                $userTenantSlug = auth()->user()->tenant->slug ?? null;

                if ($userTenantSlug) {
                    return redirect()->to("/{$userTenantSlug}/dashboard");
                }

                abort(403, 'Tenant accounts cannot access central admin dashboard.');
            }
        }

        if ($tenant) {
            app()->instance('current_tenant', $tenant);
        }

        return $next($request);
    }
}
