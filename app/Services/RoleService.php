<?php

namespace App\Services;

use App\Contracts\RoleContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class RoleService implements RoleContract
{
    public function getPaginatedRoles(
        ?string $search = null,
        int $perPage = 10,
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        return Role::query()
            ->whereNull('tenant_id')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount('permissions')
            ->when($sortBy, function ($q) use ($sortBy, $sortOrder) {
                match ($sortBy) {
                    'id', 'name', 'created_at' => $q->orderBy($sortBy, $sortOrder),
                    'permissions_count'        => $q->orderBy('permissions_count', $sortOrder),
                    default                    => $q->orderBy('created_at', $sortOrder),
                };
            }, function ($q) use ($sortOrder) {
                $q->orderBy('created_at', $sortOrder);
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function storeRole(array $data): Role
    {
        $role = Role::create([
            'name'      => $data['name'],
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
