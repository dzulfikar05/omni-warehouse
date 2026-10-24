<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\UnitContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\UnitRequest;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitsController extends Controller
{
    public function __construct(
        protected UnitContract $unitService
    ) {}

    public function index(Request $request): Response
    {
        $tenantSlug = $request->route('tenant_slug');
        $filters = [
            'search'     => $request->input('search'),
            'sort_by'    => $request->input('sort_by', 'created_at'),
            'sort_order' => $request->input('sort_order', 'desc'),
        ];

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $units = $this->unitService->getPaginatedUnits($filters, $perPage);
        $stats = $this->unitService->getUnitStats($filters);

        return Inertia::render('Tenant/InventoryManagement/Units/Index', [
            'tenant_slug' => $tenantSlug,
            'units'       => $units,
            'stats'       => $stats,
            'filters'     => array_merge($filters, ['per_page' => (string) $perPage]),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Tenant/InventoryManagement/Units/Create', [
            'tenant_slug' => $request->route('tenant_slug'),
        ]);
    }

    public function store(UnitRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->unitService->createUnit($request->validated());

        return to_route('tenant.inventory.units.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Unit created successfully.');
    }

    public function show(Request $request, string $tenant_slug, Unit $unit): Response
    {
        return Inertia::render('Tenant/InventoryManagement/Units/Show', [
            'tenant_slug' => $tenant_slug,
            'unit'        => $unit,
        ]);
    }

    public function edit(Request $request, string $tenant_slug, Unit $unit): Response
    {
        return Inertia::render('Tenant/InventoryManagement/Units/Edit', [
            'tenant_slug' => $tenant_slug,
            'unit'        => $unit,
        ]);
    }

    public function update(UnitRequest $request, string $tenant_slug, Unit $unit): RedirectResponse
    {
        $this->unitService->updateUnit($unit, $request->validated());

        return to_route('tenant.inventory.units.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Unit updated successfully.');
    }

    public function destroy(Request $request, string $tenant_slug, Unit $unit): RedirectResponse
    {
        $this->unitService->deleteUnit($unit);

        return to_route('tenant.inventory.units.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Unit deleted successfully.');
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $this->unitService->exportPdf($tenant_slug);

        return back()->with('success', 'Added to export queue. Check the notification icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $this->unitService->exportExcel($tenant_slug);

        return back()->with('success', 'Added to export queue. Check the notification icon in navbar.');
    }
}
