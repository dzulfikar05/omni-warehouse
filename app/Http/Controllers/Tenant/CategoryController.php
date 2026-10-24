<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\CategoryContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryContract $categoryService
    ) {}

    public function index(Request $request): Response
    {
        $tenantSlug = $request->route('tenant_slug');
        $filters = [
            'search'     => $request->input('search'),
            'sort_by'    => $request->input('sort_by', 'created_at'),
            'sort_order' => $request->input('sort_order', 'desc'),
        ];

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $categories = $this->categoryService->getPaginatedCategories($filters, $perPage);
        $stats      = $this->categoryService->getCategoryStats($filters);

        return Inertia::render('Tenant/InventoryManagement/Categories/Index', [
            'tenant_slug' => $tenantSlug,
            'categories'  => $categories,
            'stats'       => $stats,
            'filters'     => array_merge($filters, ['per_page' => (string) $perPage]),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Tenant/InventoryManagement/Categories/Create', [
            'tenant_slug' => $request->route('tenant_slug'),
        ]);
    }

    public function store(CategoryRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->categoryService->createCategory($request->validated());

        return to_route('tenant.inventory.categories.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Category created successfully.');
    }

    public function show(Request $request, string $tenant_slug, Category $category): Response
    {
        $category->loadCount('products');
        $category->load(['products' => function ($query) {
            $query->latest()->take(5);
        }]);

        return Inertia::render('Tenant/InventoryManagement/Categories/Show', [
            'tenant_slug' => $tenant_slug,
            'category'    => $category,
        ]);
    }

    public function edit(Request $request, string $tenant_slug, Category $category): Response
    {
        return Inertia::render('Tenant/InventoryManagement/Categories/Edit', [
            'tenant_slug' => $tenant_slug,
            'category'    => $category,
        ]);
    }

    public function update(CategoryRequest $request, string $tenant_slug, Category $category): RedirectResponse
    {
        $this->categoryService->updateCategory($category, $request->validated());

        return to_route('tenant.inventory.categories.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Request $request, string $tenant_slug, Category $category): RedirectResponse
    {
        $this->categoryService->deleteCategory($category);

        return to_route('tenant.inventory.categories.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Category deleted successfully.');
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $this->categoryService->exportPdf($tenant_slug);

        return back()->with('success', 'Added to export queue. Check the notification icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $this->categoryService->exportExcel($tenant_slug);

        return back()->with('success', 'Added to export queue. Check the notification icon in navbar.');
    }
}
