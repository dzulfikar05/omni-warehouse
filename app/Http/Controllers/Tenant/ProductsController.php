<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\ProductContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    public function __construct(
        protected ProductContract $productService
    ) {}

    public function index(Request $request): Response
    {
        $tenantSlug = $request->route('tenant_slug');
        $filters = [
            'search'      => $request->input('search'),
            'category_id' => $request->input('category_id'),
            'status'      => $request->input('status'),
            'sort_by'     => $request->input('sort_by', 'created_at'),
            'sort_order'  => $request->input('sort_order', 'desc'),
        ];

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $tenant = app('current_tenant');

        $products = $this->productService->getPaginatedProducts($filters, $perPage);
        $stats = $this->productService->getProductStats($filters);

        $categories = Category::where('tenant_id', $tenant->id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Tenant/InventoryManagement/Products/Index', [
            'tenant_slug' => $tenantSlug,
            'products'    => $products,
            'stats'       => $stats,
            'categories'  => $categories,
            'filters'     => array_merge($filters, ['per_page' => (string) $perPage]),
        ]);
    }

    public function create(Request $request): Response
    {
        $tenant = app('current_tenant');

        $categories = Category::where('tenant_id', $tenant->id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Tenant/InventoryManagement/Products/Create', [
            'tenant_slug' => $request->route('tenant_slug'),
            'categories' => $categories,
        ]);
    }

    public function store(ProductRequest $request, string $tenant_slug): RedirectResponse
    {
        $tenant = app('current_tenant');

        $this->productService->createProduct(array_merge(
            $request->validated(),
            [
                'tenant_id' => $tenant->id,
                'created_by' => auth()->id(),
            ]
        ));

        return to_route('tenant.inventory.products.index', [
            'tenant_slug' => $tenant_slug
        ])->with('success', __('Product created successfully.'));
    }

    public function show(Request $request, string $tenant_slug, Product $product): Response
    {
        $tenant = app('current_tenant');

        $product = Product::where('tenant_id', $tenant->id)
            ->findOrFail($product->id);

        $product->load(['category', 'skus.unit']);

        return Inertia::render('Tenant/InventoryManagement/Products/Show', [
            'tenant_slug' => $tenant_slug,
            'product' => $product,
        ]);
    }
    public function edit(Request $request, string $tenant_slug, Product $product): Response
    {
        $tenant = app('current_tenant');

        $product = Product::where('tenant_id', $tenant->id)
            ->findOrFail($product->id);

        $categories = Category::where('tenant_id', $tenant->id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Tenant/InventoryManagement/Products/Edit', [
            'tenant_slug' => $tenant_slug,
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(ProductRequest $request, string $tenant_slug, Product $product): RedirectResponse
    {
        $tenant = app('current_tenant');

        $product = Product::where('tenant_id', $tenant->id)
            ->findOrFail($product->id);

        $this->productService->updateProduct($product, $request->validated());

        return to_route('tenant.inventory.products.index', [
            'tenant_slug' => $tenant_slug
        ])->with('success', __('Product updated successfully.'));
    }

    public function destroy(Request $request, string $tenant_slug, Product $product): RedirectResponse
    {
        $tenant = app('current_tenant');

        $product = Product::where('tenant_id', $tenant->id)
            ->findOrFail($product->id);

        $this->productService->deleteProduct($product);

        return to_route('tenant.inventory.products.index', [
            'tenant_slug' => $tenant_slug
        ])->with('success', __('Product deleted successfully.'));
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $this->productService->exportPdf($tenant_slug);
        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $this->productService->exportExcel($tenant_slug);
        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }
}
