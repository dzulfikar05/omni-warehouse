<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\WarehousesContract;
use App\Http\Controllers\Controller;
use App\Jobs\ExportWarehouseExcelJob;
use App\Jobs\ExportWarehousePdfJob;
use App\Models\ExportLog;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    protected WarehousesContract $service;

    public function __construct(WarehousesContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $perPage   = (int) $request->input('per_page', 10);
        $sortBy    = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $warehouses = $this->service->getPaginatedWarehouses(
            $tenant_slug,
            $request->input('search'),
            $request->input('is_active'),
            $perPage,
            $sortBy,
            $sortOrder
        );

        $totalWarehouses    = Warehouse::where('tenant_id', $tenant->id)->count();
        $activeWarehouses   = Warehouse::where('tenant_id', $tenant->id)->where('is_active', true)->count();
        $inactiveWarehouses = Warehouse::where('tenant_id', $tenant->id)->where('is_active', false)->count();

        $summary = [
            'total_warehouses'    => $totalWarehouses,
            'active_warehouses'   => $activeWarehouses,
            'inactive_warehouses' => $inactiveWarehouses,
        ];

        return Inertia::render('Tenant/WarehouseStocks/Warehouses/Index', [
            'warehouses' => $warehouses,
            'summary'    => $summary,
            'filters'    => array_merge(
                $request->only(['search', 'per_page', 'is_active']),
                ['sort_by' => $sortBy, 'sort_order' => $sortOrder]
            ),
        ]);
    }

    public function create(string $tenant_slug): Response
    {
        return Inertia::render('Tenant/WarehouseStocks/Warehouses/Create');
    }

    public function store(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'code'      => 'required|string|max:100|unique:warehouses,code',
            'desc'      => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $this->service->createWarehouse($tenant_slug, $validated);

        return to_route('tenant.warehouses.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Gudang berhasil ditambahkan!');
    }

    public function show(string $tenant_slug, Warehouse $warehouse): Response
    {
        if (method_exists($warehouse, 'locations')) {
            $warehouse->load([
                'locations' => function ($q) {
                    $q->latest('created_at');
                },
                'locations.inventoryStocks.sku.product'
            ]);

            $stocks = $warehouse->locations->flatMap(function ($location) {
                return $location->inventoryStocks ?? [];
            })->values();
        } else {
            $stocks = [];
        }

        return Inertia::render('Tenant/WarehouseStocks/Warehouses/Show', [
            'warehouse' => array_merge($warehouse->toArray(), [
                'stocks' => $stocks,
            ]),
        ]);
    }

    public function edit(string $tenant_slug, Warehouse $warehouse): Response
    {
        return Inertia::render('Tenant/WarehouseStocks/Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    public function update(Request $request, string $tenant_slug, Warehouse $warehouse): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'code'      => 'required|string|max:100|unique:warehouses,code,' . $warehouse->id,
            'desc'      => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $this->service->updateWarehouse($tenant_slug, $warehouse->id, $validated);

        return to_route('tenant.warehouses.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Data gudang berhasil diperbarui!');
    }

    public function destroy(string $tenant_slug, Warehouse $warehouse): RedirectResponse
    {
        $this->service->deleteWarehouse($tenant_slug, $warehouse->id);

        return to_route('tenant.warehouses.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Gudang berhasil dihapus!');
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Warehouses_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportWarehousePdfJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the bell/download icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Warehouses_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportWarehouseExcelJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the bell/download icon in navbar.');
    }
}
