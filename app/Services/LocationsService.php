<?php

namespace App\Services;

use App\Contracts\LocationsContract;
use App\Models\Location;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class LocationsService implements LocationsContract
{
    public function getPaginatedLocations(string $tenantSlug, ?string $search, ?int $warehouseId): LengthAwarePaginator
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        // Get all warehouse IDs for this tenant
        $tenantWarehouseIds = Warehouse::where('tenant_id', $tenant->id)->pluck('id');

        return Location::whereIn('warehouse_id', $tenantWarehouseIds)
            ->with(['warehouse'])
            ->select('locations.*')
            ->selectSub(function ($query) {
                $query->selectRaw('COALESCE(
                    NULLIF((SELECT COUNT(DISTINCT sku_id) FROM inventory_stocks WHERE location_id = locations.id AND quantity > 0), 0),
                    (SELECT COUNT(DISTINCT sku_id) FROM transaction_items JOIN transactions ON transaction_items.transaction_id = transactions.id WHERE transaction_items.to_location_id = locations.id AND transactions.status = \'completed\'),
                    0
                )');
            }, 'total_sku_count')
            ->selectSub(function ($query) {
                $query->selectRaw('COALESCE(
                    NULLIF((SELECT SUM(quantity) FROM inventory_stocks WHERE location_id = locations.id), 0),
                    (SELECT SUM(quantity) FROM transaction_items JOIN transactions ON transaction_items.transaction_id = transactions.id WHERE transaction_items.to_location_id = locations.id AND transactions.status = \'completed\'),
                    0
                )');
            }, 'total_qty')
            ->when($search, function ($query, $searchQuery) {
                $query->where('rack_code', 'like', "%{$searchQuery}%")
                      ->orWhere('zone', 'like', "%{$searchQuery}%");
            })
            ->when($warehouseId, function ($query, $wid) {
                $query->where('warehouse_id', $wid);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();
    }

    public function getAllWarehouses(string $tenantSlug): Collection
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        return Warehouse::where('tenant_id', $tenant->id)->where('is_active', true)->get();
    }

    public function createLocation(string $tenantSlug, array $data): bool
    {
        $tenant  = Tenant::where('slug', $tenantSlug)->firstOrFail();

        // Ensure warehouse belongs to this tenant
        Warehouse::where('tenant_id', $tenant->id)->findOrFail($data['warehouse_id']);

        $data['created_by'] = auth()->id();

        return (bool) Location::create($data);
    }

    public function updateLocation(string $tenantSlug, int $locationId, array $data): bool
    {
        $tenant             = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tenantWarehouseIds = Warehouse::where('tenant_id', $tenant->id)->pluck('id');
        $location           = Location::whereIn('warehouse_id', $tenantWarehouseIds)->findOrFail($locationId);

        return $location->update($data);
    }

    public function deleteLocation(string $tenantSlug, int $locationId): bool
    {
        $tenant             = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tenantWarehouseIds = Warehouse::where('tenant_id', $tenant->id)->pluck('id');
        $location           = Location::whereIn('warehouse_id', $tenantWarehouseIds)->findOrFail($locationId);

        return $location->delete();
    }

    public function getLocationContents(string $tenantSlug, int $locationId): array
    {
        $tenant             = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tenantWarehouseIds = Warehouse::where('tenant_id', $tenant->id)->pluck('id');

        // Verify location belongs to tenant
        $location = Location::whereIn('warehouse_id', $tenantWarehouseIds)
            ->with('warehouse')
            ->findOrFail($locationId);

        // Aggregate stock per SKU at this location from transaction_items
        $items = \DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->leftJoin('products', 'skus.product_id', '=', 'products.id')
            ->where('transaction_items.to_location_id', $locationId)
            ->where('transactions.status', 'completed')
            ->select(
                'skus.id as sku_id',
                'skus.sku_code',
                'products.name as product_name',
                \DB::raw('SUM(transaction_items.quantity) as total_qty'),
                \DB::raw('MAX(transactions.created_at) as last_received_at')
            )
            ->groupBy('skus.id', 'skus.sku_code', 'products.name')
            ->orderByDesc('total_qty')
            ->get();

        return [
            'location' => [
                'id'        => $location->id,
                'rack_code' => $location->rack_code,
                'zone'      => $location->zone,
                'warehouse' => $location->warehouse?->name,
            ],
            'items' => $items,
        ];
    }

    public function getLocationDetails(string $tenantSlug, int $locationId): array
    {
        $tenant             = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tenantWarehouseIds = Warehouse::where('tenant_id', $tenant->id)->pluck('id');

        $location = Location::whereIn('warehouse_id', $tenantWarehouseIds)
            ->with(['warehouse'])
            ->findOrFail($locationId);

        // Fetch current active inventory stocks at this location
        $stocks = \DB::table('inventory_stocks')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->leftJoin('products', 'skus.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('inventory_stocks.location_id', $locationId)
            ->where('inventory_stocks.quantity', '>', 0)
            ->select(
                'inventory_stocks.id',
                'inventory_stocks.quantity',
                'inventory_stocks.batch_number',
                'inventory_stocks.created_at',
                'skus.id as sku_id',
                'skus.sku_code',
                'skus.barcode',
                'products.name as product_name',
                'categories.name as category_name'
            )
            ->orderByDesc('inventory_stocks.quantity')
            ->get();

        // Fallback: If inventory_stocks table is empty for this rack, fetch from transaction_items completed
        if ($stocks->isEmpty()) {
            $stocks = \DB::table('transaction_items')
                ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
                ->leftJoin('products', 'skus.product_id', '=', 'products.id')
                ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->where('transactions.status', 'completed')
                ->where('transaction_items.quantity', '>', 0)
                ->select(
                    \DB::raw('MIN(transaction_items.id) as id'),
                    \DB::raw('SUM(transaction_items.quantity) as quantity'),
                    \DB::raw('MAX(transaction_items.serial_number) as batch_number'),
                    \DB::raw('MAX(transaction_items.created_at) as created_at'),
                    'skus.id as sku_id',
                    'skus.sku_code',
                    'skus.barcode',
                    'products.name as product_name',
                    'categories.name as category_name'
                )
                ->groupBy('skus.id', 'skus.sku_code', 'skus.barcode', 'products.name', 'categories.name')
                ->orderByDesc('quantity')
                ->get();
        }

        // Fetch recent movement logs into/out of this location
        $recentMovements = \DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->leftJoin('products', 'skus.product_id', '=', 'products.id')
            ->leftJoin('users', 'transactions.created_by', '=', 'users.id')
            ->where(function ($q) use ($locationId) {
                $q->where('transaction_items.to_location_id', $locationId)
                  ->orWhere('transaction_items.from_location_id', $locationId);
            })
            ->select(
                'transactions.id as transaction_id',
                'transactions.local_uuid as reference_no',
                'transactions.transaction_type as type',
                'transactions.status',
                'transactions.created_at',
                'users.name as operator_name',
                'skus.sku_code',
                'products.name as product_name',
                'transaction_items.quantity',
                'transaction_items.to_location_id',
                'transaction_items.from_location_id'
            )
            ->orderByDesc('transactions.created_at')
            ->limit(15)
            ->get()
            ->map(function ($movement) {
                if ($movement->created_at) {
                    $movement->created_at = \Carbon\Carbon::parse($movement->created_at)->timezone('Asia/Jakarta')->format('Y-m-d H:i');
                }
                return $movement;
            });

        return [
            'location'  => $location,
            'stocks'    => $stocks,
            'movements' => $recentMovements,
        ];
    }
}
