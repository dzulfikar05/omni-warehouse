<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $proPlan = Plan::firstOrCreate(
            ['slug' => 'pro-plan'],
            [
                'name' => 'Pro Plan',
                'desc' => 'Paket lengkap untuk bisnis menengah',
                'price' => 250000.00,
                'is_active' => true,
            ]
        );

        $tenant = Tenant::firstOrCreate(
            ['slug' => 'demo-tenant'],
            [
                'name' => 'PT Demo Logistik',
                'phone' => '081234567890',
                'address' => 'Jl. Soekarno Hatta No. 123, Malang',
            ]
        );

        Subscription::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan_id' => $proPlan->id,
                'status' => 'active',
                'ends_at' => now()->addYear(),
            ]
        );

        $adminRole = Role::firstOrCreate(
            [
                'name' => 'Admin Gudang',
                'guard_name' => 'web',
                'tenant_id' => $tenant->id,
            ],
            [
                'desc' => 'Administrator penuh operasional gudang tenant',
            ]
        );

        // Assign semua permission tenant ke Admin Gudang secara otomatis
        $tenantPermissions = \Spatie\Permission\Models\Permission::where('name', 'like', 'tenant.%')->get();
        $adminRole->syncPermissions($tenantPermissions);

        // Hapus 'role_id' karena Spatie menggunakan tabel pivot model_has_roles
        $user = User::firstOrCreate(
            ['email' => 'budi@demo-tenant.com'],
            [
                'tenant_id' => $tenant->id,
                'username' => 'demoadmin',
                'name' => 'Budi Operator',
                'password' => Hash::make('password'),
            ]
        );

        if (! $user->hasRole($adminRole->name)) {
            $user->assignRole($adminRole);
        }
    }
}
