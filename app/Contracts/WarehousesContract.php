<?php

namespace App\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface WarehousesContract
{
    public function getPaginatedWarehouses(string $tenantSlug, ?string $search): LengthAwarePaginator;
    public function createWarehouse(string $tenantSlug, array $data): bool;
    public function updateWarehouse(string $tenantSlug, int $warehouseId, array $data): bool;
    public function deleteWarehouse(string $tenantSlug, int $warehouseId): bool;
}