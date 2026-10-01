<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\LocationsContract;
use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    protected LocationsContract $service;

    public function __construct(LocationsContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $locations  = $this->service->getPaginatedLocations(
            $tenant_slug,
            $request->search,
            $request->warehouse_id ? (int) $request->warehouse_id : null
        );
        $warehouses = $this->service->getAllWarehouses($tenant_slug);

        return Inertia::render('Tenant/WarehouseStocks/Locations/Index', [
            'locations'  => $locations,
            'warehouses' => $warehouses,
            'filters'    => $request->only(['search', 'warehouse_id']),
        ]);
    }

    public function show(string $tenant_slug, Location $location): Response
    {
        $details = $this->service->getLocationDetails($tenant_slug, $location->id);

        return Inertia::render('Tenant/WarehouseStocks/Locations/Show', [
            'location'  => $details['location'],
            'stocks'    => $details['stocks'],
            'movements' => $details['movements'],
        ]);
    }

    public function store(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'rack_code'    => 'required|string|max:100',
            'zone'         => 'nullable|string|max:100',
        ]);

        $this->service->createLocation($tenant_slug, $request->only(['warehouse_id', 'rack_code', 'zone']));

        return to_route('tenant.locations.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Lokasi rak berhasil ditambahkan!');
    }

    public function update(Request $request, string $tenant_slug, Location $location): RedirectResponse
    {
        $request->validate([
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'rack_code'    => 'required|string|max:100',
            'zone'         => 'nullable|string|max:100',
        ]);

        $this->service->updateLocation($tenant_slug, $location->id, $request->only(['warehouse_id', 'rack_code', 'zone']));

        return to_route('tenant.locations.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Data lokasi rak berhasil diperbarui!');
    }

    public function destroy(string $tenant_slug, Location $location): RedirectResponse
    {
        $this->service->deleteLocation($tenant_slug, $location->id);

        return to_route('tenant.locations.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Lokasi rak berhasil dihapus!');
    }

    public function contents(string $tenant_slug, int $location_id): JsonResponse
    {
        $data = $this->service->getLocationContents($tenant_slug, $location_id);
        return response()->json($data);
    }
}
