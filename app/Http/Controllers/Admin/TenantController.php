<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\TenantContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\TenantRequest;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function __construct(
        protected TenantContract $tenantService
    ) {}

    public function index(Request $request): Response
    {
        $tenants = $this->tenantService->getPaginatedTenants($request);
        $plans = Plan::where('is_active', true)->get();

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
            'plans' => $plans,
            'filters' => $request->only(['search', 'plan_id', 'status', 'sort_by', 'sort_order']),
        ]);
    }

    public function store(TenantRequest $request): RedirectResponse
    {
        $this->tenantService->createTenant($request->validated());

        return redirect()->back()->with('success', 'Tenant berhasil ditambahkan!');
    }

    public function update(TenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $this->tenantService->updateTenant($tenant, $request->validated());

        return redirect()->back()->with('success', 'Tenant berhasil diperbarui!');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $this->tenantService->deleteTenant($tenant);

        return redirect()->back()->with('success', 'Tenant berhasil dihapus!');
    }
}
