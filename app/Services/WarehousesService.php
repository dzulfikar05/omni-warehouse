<?php

namespace App\Services;

use App\Contracts\WarehousesContract;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class WarehousesService implements WarehousesContract
{
    public function getPaginatedWarehouses(
        string $tenantSlug,
        ?string $search = null,
        ?string $isActive = null,
        int $perPage = 10,
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $query = Warehouse::where('tenant_id', $tenant->id)
            ->when($search, function ($query, $searchQuery) {
                $query->where(function ($q) use ($searchQuery) {
                    $q->where('name', 'like', "%{$searchQuery}%")
                      ->orWhere('code', 'like', "%{$searchQuery}%")
                      ->orWhere('desc', 'like', "%{$searchQuery}%");
                });
            })
            ->when($isActive !== null && $isActive !== 'all', function ($query) use ($isActive) {
                $status = $isActive === '1' || $isActive === 'true';
                $query->where('is_active', $status);
            });

        // Apply Sorting
        match ($sortBy) {
            'code' => $query->orderBy('code', $sortOrder),
            'name' => $query->orderBy('name', $sortOrder),
            'is_active' => $query->orderBy('is_active', $sortOrder),
            default => $query->orderBy('created_at', $sortOrder),
        };

        return $query
            ->paginate($perPage)
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
