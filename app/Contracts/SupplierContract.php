<?php

namespace App\Contracts;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SupplierContract
{
    public function getPaginatedSuppliers(string $tenantSlug, ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function storeSupplier(string $tenantSlug, array $data): Supplier;

    public function getSupplierById(string $tenantSlug, int|string $id): Supplier;

    public function updateSupplier(string $tenantSlug, int|string $id, array $data): Supplier;

    public function deleteSupplier(string $tenantSlug, int|string $id): bool;
}
