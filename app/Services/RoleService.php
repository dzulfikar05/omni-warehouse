<?php

namespace App\Services;

use App\Contracts\RoleContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class RoleService implements RoleContract
{
    /**
     * Get paginated roles with optional search filter.
     */
    public function getPaginatedRoles(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Role::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Store a newly created role and sync permissions.
     */
    public function storeRole(array $data): Role
    {
        $role = Role::create(['name' => $data['name']]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    /**
     * Get role details with permissions.
     */
    public function getRoleDetails(int|string $id): Role
    {
        return Role::with('permissions')->findOrFail($id);
    }

    /**
     * Update the specified role and sync permissions.
     */
    public function updateRole(int|string $id, array $data): Role
    {
        $role = Role::findOrFail($id);
        $role->update(['name' => $data['name']]);

        $role->syncPermissions($data['permissions'] ?? []);

        return $role;
    }

    /**
     * Delete the specified role.
     */
    public function deleteRole(int|string $id): bool
    {
        $role = Role::findOrFail($id);

        return $role->delete();
    }
}
