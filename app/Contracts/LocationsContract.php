<?php

namespace App\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface LocationsContract
{
    public function getPaginatedLocations(string $tenantSlug, ?string $search, ?int $warehouseId): LengthAwarePaginator;
    public function getAllWarehouses(string $tenantSlug): \Illuminate\Database\Eloquent\Collection;
    public function createLocation(string $tenantSlug, array $data): bool;
    public function updateLocation(string $tenantSlug, int $locationId, array $data): bool;
    public function deleteLocation(string $tenantSlug, int $locationId): bool;
    public function getLocationContents(string $tenantSlug, int $locationId): array;
    public function getLocationDetails(string $tenantSlug, int $locationId): array;
}
