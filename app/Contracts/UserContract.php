<?php

namespace App\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserContract
{
    /**
     * Get paginated users with optional search filter.
     */
    public function getPaginatedUsers(?string $search = null, int $perPage = 10): LengthAwarePaginator;

    /**
     * Store a newly created user and assign role.
     */
    public function storeUser(array $data): User;

    /**
     * Get user details with relationships.
     */
    public function getUserDetails(int|string $id): User;

    /**
     * Update the specified user and sync roles.
     */
    public function updateUser(int|string $id, array $data): User;

    /**
     * Delete the specified user.
     */
    public function deleteUser(int|string $id): bool;
}
