<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ExportStockMovementExcelJob;
use App\Jobs\ExportStockMovementPdfJob;
use App\Models\Category;
use App\Models\ExportLog;
use App\Models\Tenant;
use App\Models\TransactionItem;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementReportController extends Controller
{
    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $query = TransactionItem::whereHas('transaction', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id);
        })->with([
            'transaction.user',
            'sku.product.category',
            'sku.unit',
            'fromLocation.warehouse',
            'toLocation.warehouse',
        ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('serial_number', 'like', "%{$search}%")
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
                $query->where(function ($q) use ($warehouseId) {
                    $q->whereHas('fromLocation', fn($l) => $l->where('warehouse_id', $warehouseId))
                      ->orWhereHas('toLocation', fn($l) => $l->where('warehouse_id', $warehouseId));
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

        if ($type = $request->input('transaction_type')) {
            if ($type !== 'all') {
                $query->whereHas('transaction', function ($q) use ($type) {
                    $q->where('transaction_type', $type);
                });
            }
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = (int) $request->input('per_page', 10);
        $reports = $query->latest('created_at')->paginate($perPage)->withQueryString();

        // Hitung Kumpulan Statistik Riil Mutasi Transaksi
        $baseTransactionQuery = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id));

        $totalInbound = (clone $baseTransactionQuery)
            ->whereHas('transaction', fn($q) => $q->whereIn('transaction_type', ['IN', 'INBOUND']))
            ->sum('quantity');

        $totalOutbound = (clone $baseTransactionQuery)
            ->whereHas('transaction', fn($q) => $q->whereIn('transaction_type', ['OUT', 'OUTBOUND']))
            ->sum('quantity');

        $totalTransfer = (clone $baseTransactionQuery)
            ->whereHas('transaction', fn($q) => $q->whereIn('transaction_type', ['TRANSFER', 'INTERNAL_TRANSFER']))
            ->sum('quantity');

        $totalMovements = (clone $baseTransactionQuery)->count();

        $summary = [
            'total_inbound'   => (float) $totalInbound,
            'total_outbound'  => (float) $totalOutbound,
            'total_transfer'  => (float) $totalTransfer,
            'total_movements' => $totalMovements,
        ];

        $warehouses = Warehouse::where('tenant_id', $tenant->id)->select('id', 'name')->get();
        $categories = Category::where('tenant_id', $tenant->id)->select('id', 'name')->get();

        return Inertia::render('Tenant/Reports/StockMovement/Index', [
            'reports'    => $reports,
            'summary'    => $summary,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'per_page', 'warehouse_id', 'category_id', 'transaction_type', 'date_from', 'date_to']),
        ]);
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Stock_Movement_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportStockMovementPdfJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the download icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Stock_Movement_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportStockMovementExcelJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the download icon in navbar.');
    }
}
