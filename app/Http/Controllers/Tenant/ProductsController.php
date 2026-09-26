<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Products;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductsController extends Controller
{
    /**
     * Menampilkan daftar produk.
     */
    public function index(Request $request)
    {
        $tenantSlug = $request->route('tenant_slug');
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        // Batasi pilihan jumlah data per halaman
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $products = Products::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render(
            'Tenant/Inventory Management/Products/index',
            [
                'tenant_slug' => $tenantSlug, // <-- DIKIRIM KE FRONTEND
                'products' => $products,
                'filters' => [
                    'search' => $search,
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
                'tenant_slug' => $request->route('tenant_slug'), // <-- TAMBAHKAN INI
            ]
        );
    }

    /**
     * Menyimpan produk baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        Products::create([
            'tenant_id' => app('current_tenant')->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
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
        return Inertia::render(
            'Tenant/Inventory Management/Products/show',
            [
                'tenant_slug' => $tenant_slug, 
                'product' => $product,
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
                'product' => $product,
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
            'category_id' => ['required'],
            'name' => ['required', 'string', 'max:255'],
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