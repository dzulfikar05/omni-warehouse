<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLoginForm($tenant_slug): Response
    {
        $tenant = app('current_tenant');

        return Inertia::render('Tenant/Auth/Login', [
            'tenant' => $tenant,
        ]);
    }

    public function login(Request $request, $tenant_slug): RedirectResponse
    {
        $tenant = app('current_tenant');

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt(array_merge($credentials, ['tenant_id' => $tenant->id]))) {
            $request->session()->regenerate();

            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);
        }

        return back()->withErrors([
            'email' => 'Invalid email or password for this company account.',
        ]);
    }

    public function logout(Request $request, $tenant_slug): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('tenant.login', ['tenant_slug' => $tenant_slug]);
    }
}
