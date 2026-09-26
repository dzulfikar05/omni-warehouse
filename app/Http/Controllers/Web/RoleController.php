<?php

namespace App\Http\Controllers\Web;

use App\Contracts\RoleContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\RoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    protected RoleContract $roleService;

    public function __construct(RoleContract $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        $roles = $this->roleService->getPaginatedRoles($search, $perPage);

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        // Hanya ambil permission Central Admin (abaikan yang berawalan tenant.%)
        $permissions = Permission::where('name', 'NOT LIKE', 'tenant.%')->get();

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        $this->roleService->storeRole($request->validated());

        return to_route('roles.index')->with('success', 'Role created successfully.');
    }

    public function show(string $id): Response
    {
        $role = $this->roleService->getRoleDetails($id);

        return Inertia::render('Roles/Show', [
            'role' => $role,
        ]);
    }

    public function edit(string $id): Response
    {
        $role = $this->roleService->getRoleDetails($id);
        $permissions = Permission::whereNull('tenant_id')->get();

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function update(RoleRequest $request, string $id): RedirectResponse
    {
        $this->roleService->updateRole($id, $request->validated());

        return to_route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $this->roleService->deleteRole($id);

        return to_route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
