<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\SkuRequest;
use App\Jobs\ExportSkuExcelJob;
use App\Jobs\ExportSkuPdfJob;
use App\Models\Category;
use App\Models\ExportLog;
use App\Models\Product;
use App\Models\Sku;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SkusController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantSlug = $request->route('tenant_slug');
        $search     = $request->input('search');
        $categoryId = $request->input('category_id');
        $unitId     = $request->input('unit_id');
        $sortBy     = $request->input('sort_by', 'created_at');
        $sortDir    = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';
        $perPage    = (int) $request->input('per_page', 10);

        if (! in_array($perPage, [10, 25, 50, 100])) {
            $perPage = 10;
        }

        $query = Sku::query()
            ->with(['product.category', 'unit'])
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('sku_code', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($categoryId && $categoryId !== 'all', function ($q) use ($categoryId) {
                $q->whereHas('product', function ($p) use ($categoryId) {
                    $p->where('category_id', $categoryId);
                });
            })
            ->when($unitId && $unitId !== 'all', function ($q) use ($unitId) {
                $q->where('unit_id', $unitId);
            });

        // Hitung Ringkasan Statistik untuk seluruh data terfilter
        $stats = [
            'total_skus'      => (clone $query)->count(),
            'total_stock'     => (int) (clone $query)->sum('current_stock'),
            'low_stock_count' => (clone $query)->whereRaw('current_stock <= COALESCE(min_stock, 5)')->count(),
            'total_valuation' => (float) ((clone $query)->select(DB::raw('SUM(base_cost * current_stock) as total'))->value('total') ?? 0),
        ];

        // Apply Sorting Dinamis & Pagination
        $skus = (clone $query)
            ->when($sortBy, function ($q) use ($sortBy, $sortDir) {
                // Pemetaan nilai sort_by legacy/dropdown atau klik header DataTable
                match ($sortBy) {
                    'oldest'     => $q->oldest(),
                    'latest'     => $q->latest(),
                    'code_asc'   => $q->orderBy('sku_code', 'asc'),
                    'code_desc'  => $q->orderBy('sku_code', 'desc'),
                    'stock_low'  => $q->orderBy('current_stock', 'asc'),
                    'stock_high' => $q->orderBy('current_stock', 'desc'),
                    'product_id' => $q->join('products', 'skus.product_id', '=', 'products.id')
                                      ->orderBy('products.name', $sortDir)
                                      ->select('skus.*'),
                    'sku_code', 'base_cost', 'current_stock', 'created_at', 'id' => $q->orderBy($sortBy, $sortDir),
                    default      => $q->orderBy('created_at', $sortDir),
                };
            }, function ($q) use ($sortDir) {
                $q->orderBy('created_at', $sortDir);
            })
            ->paginate($perPage)
            ->withQueryString();

        $categories = Category::select('id', 'name')->get();
        $units      = Unit::select('id', 'name', 'symbol')->get();

        return Inertia::render('Tenant/InventoryManagement/Sku/Index', [
            'tenant_slug' => $tenantSlug,
            'skus'        => $skus,
            'stats'       => $stats,
            'categories'  => $categories,
            'units'       => $units,
            'filters'     => [
                'search'      => $search,
                'category_id' => $categoryId,
                'unit_id'     => $unitId,
                'sort_by'     => $sortBy,
                'sort_dir'    => $sortDir,
                'per_page'    => (string) $perPage,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $products = Product::select('id', 'name')->get();
        $units    = Unit::select('id', 'name', 'symbol')->get();

        return Inertia::render('Tenant/InventoryManagement/Sku/Create', [
            'tenant_slug' => $request->route('tenant_slug'),
            'products'    => $products,
            'units'       => $units,
        ]);
    }

    public function store(SkuRequest $request, string $tenant_slug): RedirectResponse
    {
        $validated = $request->validated();
        $tenant = app('current_tenant');

        Sku::create(array_merge($validated, [
            'created_by' => $tenant ? $tenant->id : null,
        ]));

        return to_route('tenant.inventory.skus.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('SKU created successfully.'));
    }

    public function show(Request $request, string $tenant_slug, Sku $sku): Response
    {
        $sku->load(['product.category', 'unit']);

        return Inertia::render('Tenant/InventoryManagement/Sku/Show', [
            'tenant_slug' => $tenant_slug,
            'sku'         => $sku,
        ]);
    }

    public function edit(Request $request, string $tenant_slug, Sku $sku): Response
    {
        $products = Product::select('id', 'name')->get();
        $units    = Unit::select('id', 'name', 'symbol')->get();

        return Inertia::render('Tenant/InventoryManagement/Sku/Edit', [
            'tenant_slug' => $tenant_slug,
            'sku'         => $sku,
            'products'    => $products,
            'units'       => $units,
        ]);
    }

    public function update(SkuRequest $request, string $tenant_slug, Sku $sku): RedirectResponse
    {
        $sku->update($request->validated());

        return to_route('tenant.inventory.skus.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('SKU updated successfully.'));
    }

    public function destroy(Request $request, string $tenant_slug, Sku $sku): RedirectResponse
    {
        $sku->delete();

        return to_route('tenant.inventory.skus.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('SKU deleted successfully.'));
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $skus = Sku::with(['product.category', 'unit'])->get()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'SKU_Master_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportSkuPdfJob::dispatch($log->id, $skus);

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $skus = Sku::with(['product.category', 'unit'])->get()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'SKU_Master_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportSkuExcelJob::dispatch($log->id, $skus);

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }
}
