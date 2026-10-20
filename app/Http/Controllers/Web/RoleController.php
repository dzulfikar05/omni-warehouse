<?php

namespace App\Http\Controllers\Web;

use App\Contracts\RoleContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\RoleRequest;
use App\Jobs\ExportRoleExcelJob;
use App\Jobs\ExportRolePdfJob;
use App\Models\ExportLog;
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
        $search  = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        $roles = $this->roleService->getPaginatedRoles($search, $perPage);

        return Inertia::render('Roles/Index', [
            'roles'   => $roles,
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
        $role        = $this->roleService->getRoleDetails($id);
        $permissions = Permission::where('name', 'NOT LIKE', 'tenant.%')->get();

        return Inertia::render('Roles/Edit', [
            'role'        => $role,
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

    public function exportPdf(Request $request): RedirectResponse
    {
        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Central_Roles_Report_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportRolePdfJob::dispatch($log->id, $request->only(['search']));

        return back()->with('success', 'Added to export queue. Check the download icon in the navbar.');
    }

    public function exportExcel(Request $request): RedirectResponse
    {
        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Central_Roles_Report_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportRoleExcelJob::dispatch($log->id, $request->only(['search']));

        return back()->with('success', 'Added to export queue. Check the download icon in the navbar.');
    }
}
