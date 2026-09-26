<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ----------------------------------------------------
        // 1. CENTRAL / PLATFORM ADMIN PERMISSIONS
        // ----------------------------------------------------
        $centralPermissions = [
            'central.dashboard.view',

            // Submenu: Tenants Management
            'central.tenants.view', 'central.tenants.create', 'central.tenants.edit', 'central.tenants.delete',

            // Submenu: Plans Management
            'central.plans.view', 'central.plans.create', 'central.plans.edit', 'central.plans.delete',

            // Submenu: Central Users
            'central.users.view', 'central.users.show', 'central.users.create', 'central.users.edit', 'central.users.delete',

            // Submenu: Central Roles
            'central.roles.view', 'central.roles.show', 'central.roles.create', 'central.roles.edit', 'central.roles.delete',
        ];

        // ----------------------------------------------------
        // 2. TENANT WORKSPACE PERMISSIONS (Per Menu & Submenu)
        // ----------------------------------------------------
        $tenantPermissions = [
            // Menu: Dashboard
            'tenant.dashboard.view',

            // Menu Group: Warehouse & Stocks
            // Submenu: Warehouses
            'tenant.warehouses.view', 'tenant.warehouses.create', 'tenant.warehouses.edit', 'tenant.warehouses.delete',
            // Submenu: Rack & Stock Location
            'tenant.stock_locations.view', 'tenant.stock_locations.create', 'tenant.stock_locations.edit', 'tenant.stock_locations.delete',
            // Submenu: Stock Opname
            'tenant.stock_opname.view', 'tenant.stock_opname.create_session', 'tenant.stock_opname.verify', 'tenant.stock_opname.adjust',

            // Menu Group: Transaction
            // Submenu: Inbound Management
            'tenant.inbound.view', 'tenant.inbound.show', 'tenant.inbound.verify_barcode', 'tenant.inbound.putaway', 'tenant.inbound.commit', 'tenant.inbound.hold',
            // Submenu: Outbound Management
            'tenant.outbound.view', 'tenant.outbound.show', 'tenant.outbound.create', 'tenant.outbound.edit', 'tenant.outbound.commit', 'tenant.outbound.hold',
            // Submenu: Stock Transfer
            'tenant.stock_transfer.view', 'tenant.stock_transfer.create',

            // Menu Group: Contact
            // Submenu: Customer
            'tenant.contacts.customers.view', 'tenant.contacts.customers.show', 'tenant.contacts.customers.create', 'tenant.contacts.customers.edit', 'tenant.contacts.customers.delete',
            // Submenu: Supplier
            'tenant.contacts.suppliers.view', 'tenant.contacts.suppliers.show', 'tenant.contacts.suppliers.create', 'tenant.contacts.suppliers.edit', 'tenant.contacts.suppliers.delete',

            // Menu Group: Settings
            // Submenu: Company Profile
            'tenant.company_profile.view', 'tenant.company_profile.edit', 'tenant.company_profile.delete_logo',
            // Submenu: User & Roles
            'tenant.users.view', 'tenant.users.show', 'tenant.users.create', 'tenant.users.edit', 'tenant.users.delete',
            'tenant.roles.view', 'tenant.roles.show', 'tenant.roles.create', 'tenant.roles.edit', 'tenant.roles.delete',
        ];

        // Registrasi seluruh permission ke database
        $allPermissions = array_merge($centralPermissions, $tenantPermissions);
        foreach ($allPermissions as $value) {
            Permission::firstOrCreate([
                'name' => $value,
                'guard_name' => 'web',
            ]);
        }

        // --- Role Superadmin Central ---
        $superadminRole = Role::firstOrCreate([
            'name' => 'superadmin',
            'guard_name' => 'web',
            'tenant_id' => null, // Pastikan role bernilai NULL untuk Central Admin
        ]);

        // Superadmin central diberikan seluruh permission central
        $centralPermissionsModels = Permission::whereIn('name', $centralPermissions)->get();
        $superadminRole->syncPermissions($centralPermissionsModels);

        // --- User Central Admin ---
        $user = User::firstOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin123'),
                'tenant_id' => null, // User Central Admin
            ]
        );

        // Menghubungkan User dengan Role Superadmin
        if (! $user->hasRole($superadminRole->name)) {
            $user->assignRole($superadminRole);
        }
    }
}

