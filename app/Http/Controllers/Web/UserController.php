<?php

namespace App\Http\Controllers\Web;

use App\Contracts\UserContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\UserRequest;
use App\Jobs\ExportUserExcelJob;
use App\Jobs\ExportUserPdfJob;
use App\Models\ExportLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    protected UserContract $userService;

    public function __construct(UserContract $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): Response
    {
        $search    = $request->input('search');
        $perPage   = (int) $request->input('per_page', 10);
        $sortBy    = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $users = $this->userService->getPaginatedUsers($search, $perPage, $sortBy, $sortOrder);

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'per_page', 'sort_by', 'sort_order']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::where('guard_name', 'web')->get(),
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $this->userService->storeUser($request->validated());

        return to_route('users.index')->with('success', 'User created successfully.');
    }

    public function show(string $id): Response
    {
        $user = $this->userService->getUserDetails($id);

        return Inertia::render('Users/Show', [
            'user' => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'created_at'      => $user->created_at,
                'roles'           => $user->roles->pluck('name'),
                'all_permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    public function edit(string $id): Response
    {
        $user = User::whereNull('tenant_id')->with('roles')->findOrFail($id);

        return Inertia::render('Users/Edit', [
            'user'  => $user,
            'roles' => Role::where('guard_name', 'web')->get(),
        ]);
    }

    public function update(UserRequest $request, string $id): RedirectResponse
    {
        $this->userService->updateUser($id, $request->validated());

        return to_route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $this->userService->deleteUser($id);

        return to_route('users.index')->with('success', 'User deleted successfully.');
    }

    public function exportPdf(Request $request): RedirectResponse
    {
        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Central_Users_Report_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportUserPdfJob::dispatch($log->id, $request->only(['search']));

        return back()->with('success', 'Added to export queue. Check the bell/download icon in the navbar.');
    }

    public function exportExcel(Request $request): RedirectResponse
    {
        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Central_Users_Report_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportUserExcelJob::dispatch($log->id, $request->only(['search']));

        return back()->with('success', 'Added to export queue. Check the bell/download icon in the navbar.');
    }
}
