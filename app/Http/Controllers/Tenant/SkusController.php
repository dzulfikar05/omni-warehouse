<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Products;
use App\Models\Sku;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkusController extends Controller
{
    /**
     * Menampilkan daftar SKU.
     */
    public function index(Request $request)
    {
        $tenantSlug = $request->route('tenant_slug');
        $search     = $request->input('search');
        $categoryId = $request->input('category_id');
        $unitId     = $request->input('unit_id');
        $sortBy     = $request->input('sort_by', 'latest');
        $perPage    = (int) $request->input('per_page', 10);

        // Batasi pilihan jumlah data per halaman
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $skus = Sku::query()
            ->with(['product.category', 'unit'])
            // Filter Search
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sku_code', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            // Filter Berdasarkan Kategori Product
            ->when($categoryId, function ($query, $categoryId) {
                $query->whereHas('product', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                });
            })
            // Filter Berdasarkan Unit
            ->when($unitId, function ($query, $unitId) {
                $query->where('unit_id', $unitId);
            })
            // Filter Sorting
            ->when($sortBy, function ($query, $sortBy) {
                match ($sortBy) {
                    'oldest'     => $query->oldest(),
                    'code_asc'   => $query->orderBy('sku_code', 'asc'),
                    'code_desc'  => $query->orderBy('sku_code', 'desc'),
                    'stock_low'  => $query->orderBy('current_stock', 'asc'),
                    'stock_high' => $query->orderBy('current_stock', 'desc'),
                    default      => $query->latest(),
                };
            }, function ($query) {
                $query->latest();
            })
            ->paginate($perPage)
            ->withQueryString();

        // Ambil daftar kategori dan unit untuk dropdown filter di frontend
        $categories = Category::select('id', 'name')->get();
        $units      = Unit::select('id', 'symbol')->get();

        return Inertia::render(
            'Tenant/Inventory Management/Sku/index',
            [
                'tenant_slug' => $tenantSlug,
                'skus'        => $skus,
                'categories'  => $categories,
                'units'       => $units,
                'filters'     => [
                    'search'      => $search,
                    'category_id' => $categoryId,
                    'unit_id'     => $unitId,
                    'sort_by'     => $sortBy,
                    'per_page'    => (string) $perPage,
                ],
            ]
        );
    }

    /**
     * Menampilkan form untuk menambah SKU baru.
     */
    public function create(Request $request)
    {
        $products = Products::select('id', 'name')->get();
        $units    = Unit::select('id', 'symbol')->get();

        return Inertia::render(
            'Tenant/Inventory Management/Sku/create',
            [
                'tenant_slug' => $request->route('tenant_slug'),
                'products'    => $products,
                'units'       => $units,
            ]
        );
    }

    /**
     * Menyimpan SKU baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'    => ['required', 'exists:products,id'],
            'unit_id'       => ['required', 'exists:units,id'],
            'sku_code'      => ['required', 'string', 'max:255', 'unique:skus,sku_code'],
            'barcode'       => ['nullable', 'string', 'max:255'],
            'base_cost'     => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
        ]);

        Sku::create([
            'product_id'    => $validated['product_id'],
            'unit_id'       => $validated['unit_id'],
            'sku_code'      => $validated['sku_code'],
            'barcode'       => $validated['barcode'] ?? null,
            'base_cost'     => $validated['base_cost'],
            'current_stock' => $validated['current_stock'],
            'created_by'    => app('current_tenant')->id,
        ]);

        return redirect()
            ->route('tenant.inventory.skus.index', [
                'tenant_slug' => $request->route('tenant_slug'),
            ])
            ->with('success', 'SKU created successfully.');
    }

    /**
     * Menampilkan detail SKU.
     */
    public function show(Request $request, $tenant_slug, Sku $sku)
    {
        $sku->load(['product.category', 'unit']);

        return Inertia::render(
            'Tenant/Inventory Management/Sku/show',
            [
                'tenant_slug' => $tenant_slug,
                'sku'         => $sku,
            ]
        );
    }

    /**
     * Menampilkan form edit SKU.
     */
    public function edit(Request $request, $tenant_slug, Sku $sku)
    {
        $products = Products::select('id', 'name')->get();
        $units    = Unit::select('id', 'symbol')->get();

        return Inertia::render(
            'Tenant/Inventory Management/Sku/edit',
            [
                'tenant_slug' => $tenant_slug,
                'sku'         => $sku,
                'products'    => $products,
                'units'       => $units,
            ]
        );
    }

    /**
     * Memperbarui SKU.
     */
    public function update(
        Request $request,
        $tenant_slug,
        Sku $sku
    ) {
        $validated = $request->validate([
            'product_id'    => ['required', 'exists:products,id'],
            'unit_id'       => ['required', 'exists:units,id'],
            'sku_code'      => ['required', 'string', 'max:255', "unique:skus,sku_code,{$sku->id}"],
            'barcode'       => ['nullable', 'string', 'max:255'],
            'base_cost'     => ['required', 'numeric', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
        ]);

        $sku->update($validated);

        return redirect()
            ->route('tenant.inventory.skus.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'SKU updated successfully.');
    }

    /**
     * Menghapus SKU.
     */
    public function destroy(
        Request $request,
        $tenant_slug,
        Sku $sku
    ) {
        $sku->delete();

        return redirect()
            ->route('tenant.inventory.skus.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'SKU deleted successfully.');
    }
}