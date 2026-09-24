<?php

namespace App\Services;

use App\Contracts\WarehousesContract;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class WarehousesService implements WarehousesContract
{
    public function getPaginatedWarehouses(string $tenantSlug, ?string $search): LengthAwarePaginator
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return Warehouse::where('tenant_id', $tenant->id)
            ->when($search, function ($query, $searchQuery) {
                $query->where('name', 'like', "%{$searchQuery}%")
                      ->orWhere('code', 'like', "%{$searchQuery}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function createWarehouse(string $tenantSlug, array $data): bool
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $data['tenant_id'] = $tenant->id;
        $data['created_by'] = auth()->id();

        return (bool) Warehouse::create($data);
    }

    public function updateWarehouse(string $tenantSlug, int $warehouseId, array $data): bool
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $warehouse = Warehouse::where('tenant_id', $tenant->id)->findOrFail($warehouseId);

        return $warehouse->update($data);
    }

    public function deleteWarehouse(string $tenantSlug, int $warehouseId): bool
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $warehouse = Warehouse::where('tenant_id', $tenant->id)->findOrFail($warehouseId);

        return $warehouse->delete();
    }
}