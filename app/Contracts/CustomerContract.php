<?php

namespace App\Contracts;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CustomerContract
{
    public function getPaginatedCustomers(string $tenantSlug, ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    public function storeCustomer(string $tenantSlug, array $data): Customer;

    public function getCustomerById(string $tenantSlug, int|string $id): Customer;

    public function updateCustomer(string $tenantSlug, int|string $id, array $data): Customer;

    public function deleteCustomer(string $tenantSlug, int|string $id): bool;
}
