<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Products;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class ProductsController extends Controller
{
    /**
     * Menampilkan daftar produk.
     */
    public function index(Request $request)
    {
        $tenantSlug = $request->route('tenant_slug');
        $search     = $request->input('search');
        $categoryId = $request->input('category_id');
        $sortBy     = $request->input('sort_by', 'latest');
        $perPage    = (int) $request->input('per_page', 10);

        // Batasi pilihan jumlah data per halaman
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $products = Products::query()
            ->with('category')
            // Filter Search
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($catQuery) use ($search) {
                            $catQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            // Filter Berdasarkan Kategori
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
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

        // Ambil daftar kategori untuk dropdown filter di frontend
        // Sesuaikan nama Model 'Category' jika di project Anda berbeda (misal: Categories)
        $categories = Category::select('id', 'name')->get();

        return Inertia::render(
            'Tenant/Inventory Management/Products/index',
            [
                'tenant_slug' => $tenantSlug,
                'products'    => $products,
                'categories'  => $categories,
                'filters'     => [
                    'search'      => $search,
                    'category_id' => $categoryId,
                    'sort_by'     => $sortBy,
                    'per_page'    => (string) $perPage,
                ],
            ]
        );
    }
    /**
     * Menampilkan form untuk menambah produk baru.
     */
    public function create(Request $request)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Products/create',
            [
                'tenant_slug' => $request->route('tenant_slug'),
            ]
        );
    }

    /**
     * Menyimpan produk baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:255'],
        ]);

        Products::create([
            'tenant_id'   => app('current_tenant')->id,
            'category_id' => $validated['category_id'],
            'name'        => $validated['name'],
        ]);

        return redirect()
            ->route('tenant.inventory.products.index', [
                'tenant_slug' => $request->route('tenant_slug'),
            ])
            ->with('success', 'Product created successfully.');
    }

    /**
     * Menampilkan detail produk.
     */
    public function show(Request $request, $tenant_slug, Products $product)
    {
        $product->load('category');

        return Inertia::render(
            'Tenant/Inventory Management/Products/show',
            [
                'tenant_slug' => $tenant_slug,
                'product'     => $product,
            ]
        );
    }

    /**
     * Menampilkan form edit produk.
     */
    public function edit(Request $request, $tenant_slug, Products $product)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Products/edit',
            [
                'tenant_slug' => $tenant_slug,
                'product'     => $product,
            ]
        );
    }

    /**
     * Memperbarui produk.
     */
    public function update(
        Request $request,
        $tenant_slug,
        Products $product
    ) {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name'        => ['required', 'string', 'max:255'],
        ]);

        $product->update($validated);

        return redirect()
            ->route('tenant.inventory.products.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Menghapus produk.
     */
    public function destroy(
        Request $request,
        $tenant_slug,
        Products $product
    ) {
        $product->delete();

        return redirect()
            ->route('tenant.inventory.products.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'Product deleted successfully.');
    }
}
