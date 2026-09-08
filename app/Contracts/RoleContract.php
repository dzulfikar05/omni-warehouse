<?php

namespace App\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

interface RoleContract
{
    /**
     * Get paginated roles with optional search filter.
     */
    public function getPaginatedRoles(?string $search = null, int $perPage = 10): LengthAwarePaginator;

    /**
     * Store a newly created role and sync permissions.
     */
    public function storeRole(array $data): Role;

    /**
     * Get role details with permissions.
     */
    public function getRoleDetails(int|string $id): Role;

    /**
     * Update the specified role and sync permissions.
     */
    public function updateRole(int|string $id, array $data): Role;

    /**
     * Delete the specified role.
     */
    public function deleteRole(int|string $id): bool;
}
