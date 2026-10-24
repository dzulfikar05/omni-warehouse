<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ExportStockSummaryExcelJob;
use App\Jobs\ExportStockSummaryPdfJob;
use App\Models\Category;
use App\Models\ExportLog;
use App\Models\InventoryStock;
use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockSummaryReportController extends Controller
{
    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $sortBy    = $request->input('sort_by', 'updated_at');
        $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = InventoryStock::query()
            ->select('inventory_stocks.*')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('products.tenant_id', $tenant->id)
            ->with(['sku.product.category', 'sku.unit', 'location.warehouse']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('inventory_stocks.batch_number', 'like', "%{$search}%")
                  ->orWhere('skus.sku_code', 'like', "%{$search}%")
                  ->orWhere('skus.barcode', 'like', "%{$search}%")
                  ->orWhere('products.name', 'like', "%{$search}%");
            });
        }

        if ($warehouseId = $request->input('warehouse_id')) {
            if ($warehouseId !== 'all') {
                $query->whereHas('location', function ($q) use ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId);
                });
            }
        }

        if ($categoryId = $request->input('category_id')) {
            if ($categoryId !== 'all') {
                $query->where('products.category_id', $categoryId);
            }
        }

        if ($status = $request->input('status')) {
            if ($status === 'out_of_stock') {
                $query->where('inventory_stocks.quantity', '<=', 0);
            } elseif ($status === 'low_stock') {
                $query->where('inventory_stocks.quantity', '>', 0)->where('inventory_stocks.quantity', '<=', 15);
            } elseif ($status === 'in_stock') {
                $query->where('inventory_stocks.quantity', '>', 15);
            }
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('inventory_stocks.updated_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('inventory_stocks.updated_at', '<=', $dateTo);
        }

        // Apply Click-to-Sort Sorting
        match ($sortBy) {
            'quantity' => $query->orderBy('inventory_stocks.quantity', $sortOrder),
            'batch_number' => $query->orderBy('inventory_stocks.batch_number', $sortOrder),
            'status' => $query->orderBy('inventory_stocks.quantity', $sortOrder),
            'sku_id' => $query->orderBy('skus.sku_code', $sortOrder),
            'product_name' => $query->orderBy('products.name', $sortOrder),
            'base_cost' => $query->orderBy('skus.base_cost', $sortOrder),
            'total_value' => $query->orderBy(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'), $sortOrder),
            default => $query->orderBy('inventory_stocks.updated_at', $sortOrder),
        };

        $perPage = (int) $request->input('per_page', 10);
        $reports = $query->paginate($perPage)->withQueryString();

        // Hitung Kumpulan Statistik Sesuai Database
        $tenantStockQuery = InventoryStock::whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id));

        $totalProducts = (clone $tenantStockQuery)->distinct('sku_id')->count('sku_id');
        $totalQuantity = (float) (clone $tenantStockQuery)->sum('quantity');

        $totalValue = (clone $tenantStockQuery)
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->sum(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'));

        $lowStockItems = (clone $tenantStockQuery)->where('quantity', '>', 0)->where('quantity', '<=', 15)->count();
        $outOfStock = (clone $tenantStockQuery)->where('quantity', '<=', 0)->count();

        $summary = [
            'total_products'        => $totalProducts,
            'total_quantity'        => $totalQuantity,
            'total_inventory_value' => (float) $totalValue,
            'low_stock_items'       => $lowStockItems,
            'out_of_stock'          => $outOfStock,
        ];

        $warehouses = Warehouse::where('tenant_id', $tenant->id)->select('id', 'name')->get();
        $categories = Category::where('tenant_id', $tenant->id)->select('id', 'name')->get();

        return Inertia::render('Tenant/Reports/StockSummary/Index', [
            'reports'    => $reports,
            'summary'    => $summary,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'filters'    => array_merge(
                $request->only(['search', 'per_page', 'warehouse_id', 'category_id', 'status', 'date_from', 'date_to']),
                ['sort_by' => $sortBy, 'sort_order' => $sortOrder]
            ),
        ]);
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Stock_Summary_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportStockSummaryPdfJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the bell/download icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Stock_Summary_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportStockSummaryExcelJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the bell/download icon in navbar.');
    }
}
