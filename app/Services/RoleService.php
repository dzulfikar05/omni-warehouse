<?php

namespace App\Services;

use App\Contracts\RoleContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class RoleService implements RoleContract
{
    public function getPaginatedRoles(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return Role::query()
            ->whereNull('tenant_id') // Hanya role milik Central Admin
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount('permissions')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function storeRole(array $data): Role
    {
        $role = Role::create([
            'name' => $data['name'],
            'tenant_id' => null,
        ]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    public function getRoleDetails(int|string $id): Role
    {
        return Role::whereNull('tenant_id')
            ->with('permissions')
            ->findOrFail($id);
    }

    public function updateRole(int|string $id, array $data): Role
    {
        $role = Role::whereNull('tenant_id')->findOrFail($id);
        $role->update(['name' => $data['name']]);

        $role->syncPermissions($data['permissions'] ?? []);

        return $role;
    }

    public function deleteRole(int|string $id): bool
    {
        $role = Role::whereNull('tenant_id')->findOrFail($id);

        return $role->delete();
    }
}
