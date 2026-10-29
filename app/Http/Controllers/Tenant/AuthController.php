<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\TenantContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\TenantRegisterRequest;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

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

    public function register(
        TenantRegisterRequest $request
    ): RedirectResponse {
        $this->tenantService->registerTenant(
            $request->validated()
        );

        return redirect()
            ->route('login')
            ->with(
                'success',
                'Registrasi berhasil. Silakan login menggunakan akun admin Anda.'
            );
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
            'email' => __('The email address or password is incorrect for this company workspace.'),
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
            'tenant.required' => __('Enter a tenant name or workspace slug.'),
            'email.required'  => __('Enter your account email address.'),
        ]);

        $inputTenant = trim($request->input('tenant'));
        $email = trim($request->input('email'));

        $tenant = Tenant::where(function ($q) use ($inputTenant) {
            $q->where('slug', strtolower($inputTenant))
                ->orWhere('name', 'ILIKE', "%{$inputTenant}%"); // ILIKE untuk PostgreSQL
        })->first();

        if (!$tenant) {
            return back()->withErrors([
                'tenant' => __('The workspace or tenant could not be found.'),
            ]);
        }

        // Verifikasi apakah user dengan email tersebut terdaftar di tenant ini
        $userExists = User::where('tenant_id', $tenant->id)
            ->where('email', $email)
            ->exists();

        if (!$userExists) {
            return back()->withErrors([
                'email' => __('Account email :email is not registered in workspace :workspace.', [
                    'email' => $email,
                    'workspace' => $tenant->name,
                ]),
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

    public function showForgotPasswordForm($tenant_slug): Response
    {
        $tenant = app('current_tenant');

        return Inertia::render('Tenant/Auth/ForgotPassword', [
            'tenant' => $tenant,
            'status' => session('status'),
        ]);
    }

    public function sendResetLink(Request $request, $tenant_slug): RedirectResponse
    {
        $tenant = app('current_tenant');

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Verifikasi keberadaan pengguna khusus pada tenant ini
        $user = User::where('tenant_id', $tenant->id)
            ->where('email', $request->email)
            ->first();

        if (!$user) {
            return back()->withErrors([
                'email' => __('We cannot find a user with that email address in this company workspace.'),
            ]);
        }

        // Kirim token reset password
        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }

    public function showResetPasswordForm(Request $request, $tenant_slug): Response
    {
        $tenant = app('current_tenant');

        return Inertia::render('Tenant/Auth/ResetPassword', [
            'tenant' => $tenant,
            'token' => $request->route('token'),
            'email' => $request->email,
        ]);
    }

    /**
     * Handle an incoming new password request for Tenant.
     */
    public function resetPassword(Request $request, $tenant_slug): RedirectResponse
    {
        $tenant = app('current_tenant');

        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        // Verifikasi bahwa user milik tenant ini
        $user = User::where('tenant_id', $tenant->id)
            ->where('email', $request->email)
            ->first();

        if (!$user) {
            return back()->withErrors([
                'email' => __('We cannot find a user with that email address in this workspace.'),
            ]);
        }

        // Eksekusi reset password melalui Password Broker
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('tenant.login', ['tenant_slug' => $tenant->slug])
            ->with('status', __($status))
            : back()->withErrors(['email' => __($status)]);
    }
}
