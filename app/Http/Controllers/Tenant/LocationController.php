<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\LocationsContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\LocationRequest;
use App\Jobs\ExportLocationExcelJob;
use App\Jobs\ExportLocationPdfJob;
use App\Models\ExportLog;
use App\Models\Location;
use App\Models\Tenant;
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
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $perPage   = (int) $request->input('per_page', 15);
        $sortBy    = $request->input('sort_by', 'created_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $locations = $this->service->getPaginatedLocations(
            $tenant_slug,
            $request->search,
            $request->warehouse_id ? (int) $request->warehouse_id : null,
            $perPage,
            $sortBy,
            $sortOrder
        );
        $warehouses = $this->service->getAllWarehouses($tenant_slug);

        $totalLocations = Location::whereHas('warehouse', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id);
        })->count();

        $activeLocations = Location::whereHas('warehouse', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id);
        })->where('is_active', true)->count();

        $inactiveLocations = Location::whereHas('warehouse', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id);
        })->where('is_active', false)->count();

        $summary = [
            'total_locations'    => $totalLocations,
            'active_locations'   => $activeLocations,
            'inactive_locations' => $inactiveLocations,
        ];

        return Inertia::render('Tenant/WarehouseStocks/Locations/Index', [
            'locations'  => $locations,
            'warehouses' => $warehouses,
            'summary'    => $summary,
            'filters'    => array_merge(
                $request->only(['search', 'warehouse_id', 'per_page']),
                ['sort_by' => $sortBy, 'sort_order' => $sortOrder]
            ),
        ]);
    }

    public function create(string $tenant_slug): Response
    {
        $warehouses = $this->service->getAllWarehouses($tenant_slug);

        return Inertia::render('Tenant/WarehouseStocks/Locations/Create', [
            'warehouses' => $warehouses,
        ]);
    }

    public function store(LocationRequest $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $request->validated();
        $data['tenant_id'] = $tenant->id;
        $data['created_by'] = auth()->id();

        $this->service->createLocation($tenant_slug, $data);

        return to_route('tenant.locations.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Storage location created successfully.'));
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

    public function edit(string $tenant_slug, Location $location): Response
    {
        $warehouses = $this->service->getAllWarehouses($tenant_slug);

        return Inertia::render('Tenant/WarehouseStocks/Locations/Edit', [
            'location'   => $location,
            'warehouses' => $warehouses,
        ]);
    }

    public function update(LocationRequest $request, string $tenant_slug, Location $location): RedirectResponse
    {
        $this->service->updateLocation($tenant_slug, $location->id, $request->validated());

        return to_route('tenant.locations.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Storage location updated successfully.'));
    }

    public function destroy(string $tenant_slug, Location $location): RedirectResponse
    {
        $this->service->deleteLocation($tenant_slug, $location->id);

        return to_route('tenant.locations.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Storage location deleted successfully.'));
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Locations_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportLocationPdfJob::dispatch($log->id, $request->all());

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Locations_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportLocationExcelJob::dispatch($log->id, $request->all());

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }
}
