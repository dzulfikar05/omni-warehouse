<?php

namespace App\Services;

use App\Contracts\TenantContract;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
                    ->orWhere('phone', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('tax_number', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->filled('plan_id') && $request->plan_id !== 'all') {
            $query->whereHas('subscription', fn($q) => $q->where('plan_id', $request->plan_id));
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->whereHas('subscription', fn($q) => $q->where('status', $request->status));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage)->withQueryString();
    }

    public function getSummaryStats(): array
    {
        return [
            'total_tenants'    => Tenant::count(),
            'active_tenants'   => Subscription::where('status', 'active')->count(),
            'inactive_tenants' => Subscription::where('status', 'inactive')->count(),
            'new_this_month'   => Tenant::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
        ];
    }

    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            $slug = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);

            $tenant = Tenant::create([
                'name'       => $data['name'],
                'slug'       => $slug,
                'phone'      => $data['phone'] ?? null,
                'email'      => $data['email'] ?? null,
                'website'    => $data['website'] ?? null,
                'tax_number' => $data['tax_number'] ?? null,
                'address'    => $data['address'] ?? null,
                'created_by' => auth()->id(),
            ]);

            if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
                $tenant->addMedia($data['logo'])->toMediaCollection('logo');
            }

            Subscription::create([
                'tenant_id'  => $tenant->id,
                'plan_id'    => $data['plan_id'],
                'status'     => 'active',
                'ends_at'    => now()->addYear(),
                'created_by' => auth()->id(),
            ]);

            return $tenant;
        });
    }

    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        return DB::transaction(function () use ($tenant, $data) {
            $tenant->update([
                'name'       => $data['name'],
                'slug'       => !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']),
                'phone'      => $data['phone'] ?? null,
                'email'      => $data['email'] ?? null,
                'website'    => $data['website'] ?? null,
                'tax_number' => $data['tax_number'] ?? null,
                'address'    => $data['address'] ?? null,
            ]);

            if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
                $tenant->clearMediaCollection('logo');
                $tenant->addMedia($data['logo'])->toMediaCollection('logo');
            }

            if ($tenant->subscription) {
                $tenant->subscription->update([
                    'plan_id' => $data['plan_id'],
                ]);
            }

            return $tenant;
        });
    }

    public function deleteTenant(Tenant $tenant): bool
    {
        return DB::transaction(fn() => $tenant->delete());
    }

    public function registerTenant(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $slug = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);

            $tenant = Tenant::create([
                'name'       => $data['name'],
                'slug'       => $slug,
                'phone'      => $data['phone'] ?? null,
                'email'      => $data['email'] ?? null,
                'website'    => $data['website'] ?? null,
                'tax_number' => $data['tax_number'] ?? null,
                'address'    => $data['address'] ?? null,
                'created_by' => auth()->id(),
            ]);

            if (isset($data['logo']) && $data['logo'] instanceof \Illuminate\Http\UploadedFile) {
                $tenant->addMedia($data['logo'])->toMediaCollection('logo');
            }

            Subscription::create([
                'tenant_id'  => $tenant->id,
                'plan_id'    => $data['plan_id'],
                'status'     => 'active',
                'ends_at'    => now()->addYear(),
                'created_by' => auth()->id(),
            ]);

            return [
                'tenant_id'   => $tenant->id,
                'tenant_slug' => $tenant->slug,
            ];
        });
    }
}
