<?php

namespace App\Services;

use App\Contracts\TenantContract;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class TenantService implements TenantContract
{
    public function getPaginatedTenants(Request $request, int $perPage = 10): LengthAwarePaginator
    {
        $query = Tenant::with(['subscription.plan', 'users']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('slug', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->filled('plan_id')) {
            $query->whereHas('subscription', function ($q) use ($request) {
                $q->where('plan_id', $request->plan_id);
            });
        }

        if ($request->filled('status')) {
            $query->whereHas('subscription', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage)->withQueryString();
    }

    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            $slug = ! empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);

            $tenant = Tenant::create([
                'name' => $data['name'],
                'slug' => $slug,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'created_by' => auth()->id(),
            ]);

            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $data['plan_id'],
                'status' => 'active',
                'ends_at' => now()->addYear(),
                'created_by' => auth()->id(),
            ]);

            return $tenant;
        });
    }

    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        return DB::transaction(function () use ($tenant, $data) {
            $tenant->update([
                'name' => $data['name'],
                'slug' => Str::slug($data['slug']),
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            if ($tenant->subscription) {
                $tenant->subscription->update([
                    'plan_id' => $data['plan_id'],
                    'status' => $data['status'] ?? 'active',
                ]);
            }

            return $tenant;
        });
    }

    public function deleteTenant(Tenant $tenant): bool
    {
        return DB::transaction(function () use ($tenant) {
            return $tenant->delete();
        });
    }


    public function registerTenant(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $slug = Str::slug($data['company_name']);

            $tenant = Tenant::create([
                'name' => $data['company_name'],
                'slug' => $slug,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            Subscription::create([
                'tenant_id' => $tenant->id,
                'plan_id' => $data['plan_id'] ?? 1,
                'status' => 'active',
                'ends_at' => now()->addYear(),
            ]);

            $adminRole = Role::firstOrCreate([
                'name' => 'Admin Gudang - ' . $tenant->name,
                'guard_name' => 'web',
            ], [
                'tenant_id' => $tenant->id,
                'desc' => 'Administrator penuh operasional gudang tenant',
            ]);

            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $data['name'],
                'email' => $data['email'],
                'username' => Str::slug($data['name']) . rand(100, 999),
                'password' => Hash::make($data['password']),
            ]);

            $user->assignRole($adminRole);

            return [
                'tenant' => $tenant,
                'user' => $user,
            ];
        });
    }
}
