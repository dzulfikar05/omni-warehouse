<?php

namespace App\Services;

use App\Contracts\UserContract;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService implements UserContract
{
    /**
     * Get paginated central users (tenant_id IS NULL) with optional search filter and dynamic sorting.
     */
    public function getPaginatedUsers(
        ?string $search = null,
        int $perPage = 10,
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): LengthAwarePaginator {
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        return User::query()
            ->whereNull('tenant_id') // Hanya ambil akun Central / System Admin
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->with('roles')
            ->when($sortBy, function ($q) use ($sortBy, $sortOrder) {
                match ($sortBy) {
                    'id', 'name', 'email', 'created_at' => $q->orderBy($sortBy, $sortOrder),
                    default                             => $q->orderBy('created_at', $sortOrder),
                };
            }, function ($q) use ($sortOrder) {
                $q->orderBy('created_at', $sortOrder);
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Store a newly created central user and assign role.
     */
    public function storeUser(array $data): User
    {
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'tenant_id' => null, // Pastikan tersimpan sebagai central admin
        ]);

        if (isset($data['role'])) {
            $user->assignRole($data['role']);
        }

        return $user;
    }

    public function storeTenantAdmin(array $data, int $tenantId): User
    {
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'tenant_id' => $tenantId,
        ]);

        // Assign role tenant admin jika role tersebut memang tersedia.
        // Tambahkan assignRole() setelah memastikan nama role di database.

        return $user;
    }

    /**
     * Get central user details with relationships.
     */
    public function getUserDetails(int|string $id): User
    {
        return User::whereNull('tenant_id')
            ->with(['roles', 'permissions'])
            ->findOrFail($id);
    }

    /**
     * Update the specified user and sync roles.
     */
    public function updateUser(int|string $id, array $data): User
    {
        $user = User::whereNull('tenant_id')->findOrFail($id);

        $user->name  = $data['name'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        if (isset($data['role'])) {
            $user->syncRoles($data['role']);
        }

        return $user;
    }

    /**
     * Delete the specified user.
     */
    public function deleteUser(int|string $id): bool
    {
        $user = User::whereNull('tenant_id')->findOrFail($id);

        return $user->delete();
    }
}
