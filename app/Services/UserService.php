<?php

namespace App\Services;

use App\Contracts\UserContract;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService implements UserContract
{
    /**
     * Get paginated users with optional search filter.
     */
    public function getPaginatedUsers(?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        return User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->with('roles')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Store a newly created user and assign role.
     */
    public function storeUser(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (isset($data['role'])) {
            $user->assignRole($data['role']);
        }

        return $user;
    }

    /**
     * Get user details with relationships.
     */
    public function getUserDetails(int|string $id): User
    {
        return User::with(['roles', 'permissions'])->findOrFail($id);
    }

    /**
     * Update the specified user and sync roles.
     */
    public function updateUser(int|string $id, array $data): User
    {
        $user = User::findOrFail($id);

        $user->name = $data['name'];
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
        $user = User::findOrFail($id);

        return $user->delete();
    }
}
