<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\TenantUserRoleContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\TenantRoleRequest;
use App\Http\Requests\Tenant\TenantUserRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TenantUserRoleController extends Controller
{
    protected TenantUserRoleContract $service;

    public function __construct(TenantUserRoleContract $service)
    {
        $this->service = $service;
    }

    protected function getTenant(string $tenant_slug): Tenant
    {
        return Tenant::where('slug', $tenant_slug)->firstOrFail();
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);
        $roleFilter = $request->input('role_filter', 'all');

        $users = $this->service->getPaginatedTenantUsers($tenant_slug, $search, $roleFilter, $perPage);
        $roles = $this->service->getPaginatedTenantRoles($tenant_slug, $search, $perPage);

        return Inertia::render('Tenant/UsersRoles/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'per_page', 'tab', 'role_filter']),
        ]);
    }

    // --- USER MANAGEMENT ---

    public function createUser(string $tenant_slug): Response
    {
        $tenant = $this->getTenant($tenant_slug);

        // HANYA ambil Role yang milik Tenant ini saja
        $roles = Role::where('tenant_id', $tenant->id)->get();

        return Inertia::render('Tenant/UsersRoles/CreateUser', [
            'roles' => $roles,
        ]);
    }

    public function storeUser(TenantUserRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->storeTenantUser($tenant_slug, $request->validated());

        return to_route('tenant.settings.users-roles', ['tenant_slug' => $tenant_slug, 'tab' => 'users'])
            ->with('success', 'Member created successfully.');
    }

    public function showUser(string $tenant_slug, string $id): Response
    {
        $tenant = $this->getTenant($tenant_slug);

        $user = User::where('tenant_id', $tenant->id)
            ->with('roles')
            ->findOrFail($id);

        return Inertia::render('Tenant/UsersRoles/ShowUser', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'initials' => strtoupper(substr($user->name, 0, 2)),
                'role' => $user->roles->first()?->name ?? 'Member',
                'status' => 'Active',
                'created_at' => $user->created_at->format('d M Y'),
                'last_login_at' => $user->updated_at->format('d M Y, H:i \W\I\B'),
                'ip_address' => 'IP: 127.0.0.1',
            ],
        ]);
    }

    public function editUser(string $tenant_slug, string $id): Response
    {
        $tenant = $this->getTenant($tenant_slug);

        $user = User::where('tenant_id', $tenant->id)
            ->with('roles')
            ->findOrFail($id);

        // HANYA ambil Role yang milik Tenant ini saja
        $roles = Role::where('tenant_id', $tenant->id)->get();

        return Inertia::render('Tenant/UsersRoles/EditUser', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? '',
            ],
            'roles' => $roles,
        ]);
    }

    public function updateUser(TenantUserRequest $request, string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->updateTenantUser($id, $request->validated());

        return to_route('tenant.settings.users-roles', ['tenant_slug' => $tenant_slug, 'tab' => 'users'])
            ->with('success', 'Member updated successfully.');
    }

    public function destroyUser(string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->deleteTenantUser($id);

        return to_route('tenant.settings.users-roles', ['tenant_slug' => $tenant_slug, 'tab' => 'users'])
            ->with('success', 'Member deleted successfully.');
    }

    // --- ROLE MANAGEMENT ---

    public function createRole(string $tenant_slug): Response
    {
        // HANYA kirim permission milik Tenant ('tenant.%')
        $permissions = Permission::where('name', 'LIKE', 'tenant.%')->get();

        return Inertia::render('Tenant/UsersRoles/CreateRole', [
            'permissions' => $permissions,
        ]);
    }

    public function storeRole(TenantRoleRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->storeTenantRole($tenant_slug, $request->validated());

        return to_route('tenant.settings.users-roles', ['tenant_slug' => $tenant_slug, 'tab' => 'roles'])
            ->with('success', 'Role created successfully.');
    }

    public function showRole(string $tenant_slug, string $id): Response
    {
        $tenant = $this->getTenant($tenant_slug);

        // FILTER: Pastikan Role milik tenant ini
        $role = Role::where('tenant_id', $tenant->id)
            ->with('permissions')
            ->findOrFail($id);

        return Inertia::render('Tenant/UsersRoles/ShowRole', [
            'role' => $role,
        ]);
    }

    public function editRole(string $tenant_slug, string $id): Response
    {
        $tenant = $this->getTenant($tenant_slug);

        // FILTER: Pastikan Role milik tenant ini
        $role = Role::where('tenant_id', $tenant->id)
            ->with('permissions')
            ->findOrFail($id);

        // HANYA kirim permission milik Tenant ('tenant.%')
        $permissions = Permission::where('name', 'LIKE', 'tenant.%')->get();

        return Inertia::render('Tenant/UsersRoles/EditRole', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function updateRole(TenantRoleRequest $request, string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->updateTenantRole($id, $request->validated());

        return to_route('tenant.settings.users-roles', ['tenant_slug' => $tenant_slug, 'tab' => 'roles'])
            ->with('success', 'Role updated successfully.');
    }

    public function destroyRole(string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->deleteTenantRole($id);

        return to_route('tenant.settings.users-roles', ['tenant_slug' => $tenant_slug, 'tab' => 'roles'])
            ->with('success', 'Role deleted successfully.');
    }
}
