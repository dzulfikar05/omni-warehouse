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
        $permissions = [
            "dashboard.view",

            "users.view",
            "users.show",
            "users.edit",
            "users.create",
            "users.delete",

            "roles.view",
            "roles.show",
            "roles.edit",
            "roles.create",
            "roles.delete",
        ];

        foreach ($permissions as $value) {
            Permission::firstOrCreate(['name' => $value, 'guard_name' => 'web']);
        }

        $superadminRole = Role::firstOrCreate(
            ['name' => 'superadmin', 'guard_name' => 'web']
        );
        $superadminRole->syncPermissions(Permission::all());

        $user = User::firstOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin123'),
            ]
        );

        if (! $user->hasRole($superadminRole->name)) {
            $user->assignRole($superadminRole);
        }
    }
}

