<?php

namespace App\Contracts;

use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

interface TenantContract
{
    public function getPaginatedTenants(Request $request, int $perPage = 10): LengthAwarePaginator;

    public function createTenant(array $data): Tenant;

    public function updateTenant(Tenant $tenant, array $data): Tenant;

    public function deleteTenant(Tenant $tenant): bool;
}
