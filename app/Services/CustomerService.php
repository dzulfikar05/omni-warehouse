<?php

namespace App\Services;

use App\Contracts\CustomerContract;
use App\Models\Customer;
use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService implements CustomerContract
{
    protected function getTenant(string $tenantSlug): Tenant
    {
        return Tenant::where('slug', $tenantSlug)->firstOrFail();
    }

    public function getPaginatedCustomers(
        string $tenantSlug,
        ?string $search = null,
        int $perPage = 10,
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $tenant    = $this->getTenant($tenantSlug);
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        return Customer::where('tenant_id', $tenant->id)
            ->when($search, function ($query, $q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('name', 'ilike', "%{$q}%")
                        ->orWhere('phone', 'ilike', "%{$q}%")
                        ->orWhere('email', 'ilike', "%{$q}%");
                });
            })
            ->when($sortBy, function ($q) use ($sortBy, $sortOrder) {
                match ($sortBy) {
                    'id', 'name', 'phone', 'email', 'tax_number', 'created_at' => $q->orderBy($sortBy, $sortOrder),
                    default                                                     => $q->orderBy('created_at', $sortOrder),
                };
            }, function ($q) use ($sortOrder) {
                $q->orderBy('created_at', $sortOrder);
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function storeCustomer(string $tenantSlug, array $data): Customer
    {
        $tenant = $this->getTenant($tenantSlug);

        return Customer::create([
            ...$data,
            'tenant_id'  => $tenant->id,
            'created_by' => auth()->id(),
        ]);
    }

    public function getCustomerById(string $tenantSlug, int|string $id): Customer
    {
        $tenant = $this->getTenant($tenantSlug);

        return Customer::where('tenant_id', $tenant->id)->findOrFail($id);
    }

    public function updateCustomer(string $tenantSlug, int|string $id, array $data): Customer
    {
        $customer = $this->getCustomerById($tenantSlug, $id);
        $customer->update($data);

        return $customer;
    }

    public function deleteCustomer(string $tenantSlug, int|string $id): bool
    {
        $customer = $this->getCustomerById($tenantSlug, $id);

        return $customer->delete();
    }
}
