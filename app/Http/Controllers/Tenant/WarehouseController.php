<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\WarehousesContract;
use App\Http\Controllers\Controller;
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
        $warehouses = $this->service->getPaginatedWarehouses($tenant_slug, $request->search);

        return Inertia::render('Tenant/WarehouseStocks/Warehouses/Index', [
            'warehouses' => $warehouses,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request, string $tenant_slug): RedirectResponse
{
    $request->validate([
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:100|unique:warehouses,code',
        'desc' => 'nullable|string|max:100',
        'is_active' => 'boolean',
    ]);

    // Hanya ambil data yang bersih dari request (mengabaikan id kosong jika ada)
    $this->service->createWarehouse($tenant_slug, $request->only([
        'name', 'code', 'desc', 'is_active'
    ]));

    return to_route('tenant.warehouses.index', ['tenant_slug' => $tenant_slug])
        ->with('success', 'Gudang berhasil ditambahkan!');
}

    public function update(Request $request, string $tenant_slug, Warehouse $warehouse): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:warehouses,code,' . $warehouse->id,
            'desc' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $this->service->updateWarehouse($tenant_slug, $warehouse->id, $request->all());

        return to_route('tenant.warehouses.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Data gudang berhasil diperbarui!');
    }

    public function destroy(string $tenant_slug, Warehouse $warehouse): RedirectResponse
    {
        $this->service->deleteWarehouse($tenant_slug, $warehouse->id);

        return to_route('tenant.warehouses.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Gudang berhasil dihapus!');
    }
}