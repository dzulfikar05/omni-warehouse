<?php

namespace App\Services;

use App\Contracts\TenantUserRoleContract;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TenantUserRoleService implements TenantUserRoleContract
{
    public function getPaginatedTenantUsers(string $tenantSlug, ?string $search = null, ?string $roleFilter = null, int $perPage = 10): LengthAwarePaginator
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return User::query()
            ->where('tenant_id', $tenant->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($roleFilter && $roleFilter !== 'all', function ($query) use ($roleFilter) {
                $query->whereHas('roles', fn($q) => $q->where('name', $roleFilter));
            })
            ->with('roles')
            ->latest()
            ->paginate($perPage)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'initials' => strtoupper(substr($user->name, 0, 2)),
                    'role' => $user->roles->first()?->name ?? 'Member',
                    'status' => 'Active',
                    'last_login_at' => $user->updated_at ? $user->updated_at->format('d M Y, H:i \W\I\B') : 'Never logged in',
                    'ip_address' => 'IP: 127.0.0.1 (Localhost)',
                ];
            })
            ->withQueryString();
    }

    public function getPaginatedTenantRoles(string $tenantSlug, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return Role::query()
            ->where('tenant_id', $tenant->id)
            ->orWhereNull('tenant_id')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->withCount(['permissions'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function storeTenantUser(string $tenantSlug, array $data): User
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (isset($data['role'])) {
            $user->assignRole($data['role']);
        }

        return $user;
    }

    public function updateTenantUser(int|string $userId, array $data): User
    {
        $user = User::findOrFail($userId);

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return $user;
    }

    public function deleteTenantUser(int|string $userId): bool
    {
        $user = User::findOrFail($userId);
        return $user->delete();
    }

    public function storeTenantRole(string $tenantSlug, array $data): Role
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $role = Role::create([
            'name' => $data['name'],
            'tenant_id' => $tenant->id,
            'guard_name' => 'web',
        ]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role;
    }

    public function updateTenantRole(int|string $roleId, array $data): Role
    {
        $role = Role::findOrFail($roleId);
        $role->update(['name' => $data['name']]);

        $role->syncPermissions($data['permissions'] ?? []);

        return $role;
    }

    public function deleteTenantRole(int|string $roleId): bool
    {
        $role = Role::findOrFail($roleId);
        return $role->delete();
    }
}
