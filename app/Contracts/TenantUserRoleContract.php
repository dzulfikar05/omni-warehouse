<?php

namespace App\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

interface TenantUserRoleContract
{
    /**
     * Ambil data Users terpaginasi milik tenant tertentu.
     */
    public function getPaginatedTenantUsers(string $tenantSlug, ?string $search = null, ?string $roleFilter = null, int $perPage = 10): LengthAwarePaginator;

    /**
     * Ambil data Roles terpaginasi milik tenant tertentu.
     */
    public function getPaginatedTenantRoles(string $tenantSlug, ?string $search = null, int $perPage = 10): LengthAwarePaginator;

    /**
     * Buat User baru di bawah tenant tertentu.
     */
    public function storeTenantUser(string $tenantSlug, array $data): User;

    /**
     * Update User milik tenant.
     */
    public function updateTenantUser(int|string $userId, array $data): User;

    /**
     * Hapus User milik tenant.
     */
    public function deleteTenantUser(int|string $userId): bool;

    /**
     * Buat Role baru untuk tenant.
     */
    public function storeTenantRole(string $tenantSlug, array $data): Role;

    /**
     * Update Role milik tenant.
     */
    public function updateTenantRole(int|string $roleId, array $data): Role;

    /**
     * Hapus Role milik tenant.
     */
    public function deleteTenantRole(int|string $roleId): bool;
}
