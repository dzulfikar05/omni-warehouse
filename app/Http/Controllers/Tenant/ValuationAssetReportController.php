<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ExportValuationAssetExcelJob;
use App\Jobs\ExportValuationAssetPdfJob;
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

class ValuationAssetReportController extends Controller
{
    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $query = InventoryStock::whereHas('sku.product', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id);
        })->with(['sku.product.category', 'sku.unit', 'location.warehouse']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                  ->orWhereHas('sku', function ($sq) use ($search) {
                      $sq->where('sku_code', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($pq) use ($search) {
                            $pq->where('name', 'like', "%{$search}%");
                        });
                  });
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
                $query->whereHas('sku.product', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                });
            }
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('updated_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('updated_at', '<=', $dateTo);
        }

        $perPage = (int) $request->input('per_page', 10);
        $reports = $query->latest('updated_at')->paginate($perPage)->withQueryString();

        // Hitung Kumpulan Statistik Riil Valuation Asset
        $tenantStockQuery = InventoryStock::whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id));

        $totalAssetValue = (clone $tenantStockQuery)
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->sum(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'));

        $totalSKUs = (clone $tenantStockQuery)->distinct('sku_id')->count('sku_id');
        $totalQuantity = (float) (clone $tenantStockQuery)->sum('quantity');

        $avgUnitCost = $totalQuantity > 0 ? ($totalAssetValue / $totalQuantity) : 0;

        $summary = [
            'total_asset_value' => (float) $totalAssetValue,
            'total_skus'        => $totalSKUs,
            'total_quantity'   => $totalQuantity,
            'avg_unit_cost'     => (float) $avgUnitCost,
        ];

        $warehouses = Warehouse::where('tenant_id', $tenant->id)->select('id', 'name')->get();
        $categories = Category::where('tenant_id', $tenant->id)->select('id', 'name')->get();

        return Inertia::render('Tenant/Reports/ValuationAsset/Index', [
            'reports'    => $reports,
            'summary'    => $summary,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'per_page', 'warehouse_id', 'category_id', 'date_from', 'date_to']),
        ]);
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Valuation_Asset_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportValuationAssetPdfJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the download icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Valuation_Asset_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportValuationAssetExcelJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the download icon in navbar.');
    }
}
