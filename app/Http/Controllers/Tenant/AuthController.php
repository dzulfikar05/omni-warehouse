<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\TenantContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\TenantRegisterRequest;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(
        protected TenantContract $tenantService
    ) {}

    public function showTenantWelcome($tenant_slug): Response
    {
        $tenant = app('current_tenant');

        return Inertia::render('Tenant/Welcome', [
            'tenant' => $tenant,
        ]);
    }

    public function showRegisterForm(Request $request): Response
    {
        $plans = Plan::where('is_active', true)->get();

        return Inertia::render('Tenant/Auth/Register', [
            'plans' => $plans,
            'selectedPlanId' => $request->query('plan_id'),
        ]);
    }

    public function register(TenantRegisterRequest $request): Response
    {
        $result = $this->tenantService->registerTenant($request->validated());

        return Inertia::render('Tenant/Auth/RegisterSuccess', [
            'tenant' => $result['tenant'],
            'user' => $result['user'],
        ]);
    }

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

        return redirect()->route('tenant.welcome', ['tenant_slug' => $tenant_slug]);
    }

    public function showFindTenantForm(): Response
    {
        return Inertia::render('auth/FindTenant');
    }

    public function findTenant(Request $request)
    {
        $request->validate([
            'tenant' => ['required', 'string', 'max:255'],
            'email'  => ['required', 'email'],
        ], [
            'tenant.required' => 'Nama atau Slug Tenant wajib diisi.',
            'email.required'  => 'Email akun Anda wajib diisi.',
        ]);

        $inputTenant = trim($request->input('tenant'));
        $email = trim($request->input('email'));

        $tenant = Tenant::where(function ($q) use ($inputTenant) {
            $q->where('slug', strtolower($inputTenant))
              ->orWhere('name', 'ILIKE', "%{$inputTenant}%"); // ILIKE untuk PostgreSQL
        })->first();

        if (!$tenant) {
            return back()->withErrors([
                'tenant' => 'Workspace / Tenant tidak ditemukan dalam sistem.',
            ]);
        }

        // Verifikasi apakah user dengan email tersebut terdaftar di tenant ini
        $userExists = User::where('tenant_id', $tenant->id)
            ->where('email', $email)
            ->exists();

        if (!$userExists) {
            return back()->withErrors([
                'email' => "Akun email {$email} tidak terdaftar pada workspace {$tenant->name}.",
            ]);
        }

        // Redirect ke halaman sukses dengan membawa data tenant & email terverifikasi
        return Inertia::render('auth/FindTenantSuccess', [
            'tenant' => [
                'id'        => $tenant->id,
                'name'      => $tenant->name,
                'slug'      => $tenant->slug,
                'login_url' => url("/{$tenant->slug}/login"),
            ],
            'email' => $email,
        ]);
    }
}
