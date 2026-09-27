<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Menampilkan daftar kategori dengan fitur search, sorting, & pagination.
     */
    public function index(Request $request)
    {
        $tenantSlug = $request->route('tenant_slug');
        $search     = $request->input('search');
        $sortBy     = $request->input('sort_by', 'latest');
        $perPage    = (int) $request->input('per_page', 10);

        // Batasi pilihan jumlah data per halaman
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $categories = Category::query()
            // Filter Search (Berdasarkan name, desc, atau id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%")
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            })
            // Filter Sorting
            ->when($sortBy, function ($query, $sortBy) {
                match ($sortBy) {
                    'oldest'    => $query->oldest(),
                    'name_asc'  => $query->orderBy('name', 'asc'),
                    'name_desc' => $query->orderBy('name', 'desc'),
                    default     => $query->latest(),
                };
            }, function ($query) {
                $query->latest();
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render(
            'Tenant/Inventory Management/Categories/index',
            [
                'tenant_slug' => $tenantSlug,
                'categories'  => $categories,
                'filters'     => [
                    'search'    => $search,
                    'sort_by'   => $sortBy,
                    'per_page'  => (string) $perPage,
                ],
            ]
        );
    }

    /**
     * Menampilkan form untuk menambah kategori baru.
     */
    public function create(Request $request)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Categories/create',
            [
                'tenant_slug' => $request->route('tenant_slug'),
            ]
        );
    }

    /**
     * Menyimpan kategori baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'desc' => ['nullable', 'string'],
        ]);

        Category::create([
            'tenant_id' => app('current_tenant')->id,
            'name'      => $validated['name'],
            'desc'      => $validated['desc'] ?? null,
        ]);

        return redirect()
            ->route('tenant.inventory.categories.index', [
                'tenant_slug' => $request->route('tenant_slug'),
            ])
            ->with('success', 'Category created successfully.');
    }

    /**
     * Menampilkan detail kategori.
     */
    public function show(Request $request, $tenant_slug, Category $category)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Categories/show',
            [
                'tenant_slug' => $tenant_slug,
                'category'    => $category,
            ]
        );
    }

    /**
     * Menampilkan form edit kategori.
     */
    public function edit(Request $request, $tenant_slug, Category $category)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Categories/edit',
            [
                'tenant_slug' => $tenant_slug,
                'category'    => $category,
            ]
        );
    }

    /**
     * Memperbarui data kategori.
     */
    public function update(
        Request $request,
        $tenant_slug,
        Category $category
    ) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'desc' => ['nullable', 'string'],
        ]);

        $category->update($validated);

        return redirect()
            ->route('tenant.inventory.categories.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Menghapus kategori.
     */
    public function destroy(
        Request $request,
        $tenant_slug,
        Category $category
    ) {
        $category->delete();

        return redirect()
            ->route('tenant.inventory.categories.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'Category deleted successfully.');
    }
}