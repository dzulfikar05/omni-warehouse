<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\TenantContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\TenantRequest;
use App\Jobs\ExportTenantExcelJob;
use App\Jobs\ExportTenantPdfJob;
use App\Models\ExportLog;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
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

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $this->tenantService->getPaginatedTenants($request),
            'stats'   => $this->tenantService->getSummaryStats(),
            'plans'   => Plan::where('is_active', true)->get(),
            'filters' => $request->only(['search', 'plan_id', 'status', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    public function create(): Response
    {

        return Inertia::render('Admin/Tenants/Create', [
            'plans' => Plan::where('is_active', true)->get(),
        ]);
    }

    public function store(TenantRequest $request): RedirectResponse
    {

        $this->tenantService->createTenant($request->validated());

        return redirect()->route('admin.tenants.index')->with('success', __('Tenant created successfully.'));
    }

    public function show(Tenant $tenant): Response
    {

        $tenant->load(['subscription.plan', 'media']);
        $tenant->logo_url = $tenant->getFirstMediaUrl('logo');

        return Inertia::render('Admin/Tenants/Show', [
            'tenant' => $tenant,
        ]);
    }

    public function edit(Tenant $tenant): Response
    {

        $tenant->load(['subscription.plan', 'media']);
        $tenant->logo_url = $tenant->getFirstMediaUrl('logo');

        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => $tenant,
            'plans'  => Plan::where('is_active', true)->get(),
        ]);
    }

    public function update(TenantRequest $request, Tenant $tenant): RedirectResponse
    {

        $this->tenantService->updateTenant($tenant, $request->validated());

        return redirect()->route('admin.tenants.index')->with('success', __('Tenant details updated successfully.'));
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {

        $this->tenantService->deleteTenant($tenant);

        return redirect()->back()->with('success', __('Tenant permanently deleted successfully.'));
    }

    public function exportExcel(): RedirectResponse
    {

        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Tenants_Report_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportTenantExcelJob::dispatch($log->id);

        return back()->with('success', __('Export queued successfully. Check system notifications.'));
    }

    public function exportPdf(): RedirectResponse
    {

        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Tenants_Report_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportTenantPdfJob::dispatch($log->id);

        return back()->with('success', __('PDF generation queued successfully. Check system notifications.'));
    }
}
