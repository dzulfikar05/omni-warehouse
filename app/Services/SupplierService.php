<?php

namespace App\Services;

use App\Contracts\SupplierContract;
use App\Models\Supplier;
use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierService implements SupplierContract
{
    protected function getTenant(string $tenantSlug): Tenant
    {
        return Tenant::where('slug', $tenantSlug)->firstOrFail();
    }

    public function getPaginatedSuppliers(string $tenantSlug, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $tenant = $this->getTenant($tenantSlug);

        return Supplier::where('tenant_id', $tenant->id)
            ->when($search, function ($query, $q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('name', 'ilike', "%{$q}%")
                        ->orWhere('pic', 'ilike', "%{$q}%")
                        ->orWhere('phone', 'ilike', "%{$q}%")
                        ->orWhere('email', 'ilike', "%{$q}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function storeSupplier(string $tenantSlug, array $data): Supplier
    {
        $tenant = $this->getTenant($tenantSlug);

        return Supplier::create([
            ...$data,
            'tenant_id' => $tenant->id,
            'created_by' => auth()->id(),
        ]);
    }

    public function getSupplierById(string $tenantSlug, int|string $id): Supplier
    {
        $tenant = $this->getTenant($tenantSlug);

        return Supplier::where('tenant_id', $tenant->id)->findOrFail($id);
    }

    public function updateSupplier(string $tenantSlug, int|string $id, array $data): Supplier
    {
        $supplier = $this->getSupplierById($tenantSlug, $id);
        $supplier->update($data);

        return $supplier;
    }

    public function deleteSupplier(string $tenantSlug, int|string $id): bool
    {
        $supplier = $this->getSupplierById($tenantSlug, $id);

        return $supplier->delete();
    }
}
