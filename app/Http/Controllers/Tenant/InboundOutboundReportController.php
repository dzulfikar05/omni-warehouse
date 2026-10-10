<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ExportInboundOutboundExcelJob;
use App\Jobs\ExportInboundOutboundPdfJob;
use App\Models\Category;
use App\Models\ExportLog;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboundOutboundReportController extends Controller
{
    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $query = TransactionItem::whereHas('transaction', function ($q) use ($tenant) {
            $q->where('tenant_id', $tenant->id)
              ->whereIn('transaction_type', ['IN', 'OUT', 'INBOUND', 'OUTBOUND']);
        })->with([
            'transaction.supplier',
            'transaction.customer',
            'sku.product.category',
            'sku.unit',
        ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('serial_number', 'like', "%{$search}%")
                  ->orWhereHas('transaction', function ($tq) use ($search) {
                      $tq->where('local_uuid', 'like', "%{$search}%");
                  })
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

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->whereHas('transaction', function ($q) use ($status) {
                    $q->where('status', $status);
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

        // Hitung Kumpulan Statistik Riil Inbound & Outbound
        $baseItemQuery = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id));

        $totalReceived = (clone $baseItemQuery)
            ->whereHas('transaction', fn($q) => $q->whereIn('transaction_type', ['IN', 'INBOUND']))
            ->sum('quantity');

        $totalDispatch = (clone $baseItemQuery)
            ->whereHas('transaction', fn($q) => $q->whereIn('transaction_type', ['OUT', 'OUTBOUND']))
            ->sum('quantity');

        $baseTxQuery = Transaction::where('tenant_id', $tenant->id);

        $openInboundPos = (clone $baseTxQuery)
            ->whereIn('transaction_type', ['IN', 'INBOUND'])
            ->where('status', 'pending')
            ->count();

        $openOutboundPos = (clone $baseTxQuery)
            ->whereIn('transaction_type', ['OUT', 'OUTBOUND'])
            ->where('status', 'pending')
            ->count();

        $summary = [
            'total_received_units' => (float) $totalReceived,
            'total_dispatch_units' => (float) $totalDispatch,
            'open_inbound_pos'     => $openInboundPos,
            'open_outbound_pos'    => $openOutboundPos,
        ];

        $warehouses = Warehouse::where('tenant_id', $tenant->id)->select('id', 'name')->get();
        $categories = Category::where('tenant_id', $tenant->id)->select('id', 'name')->get();

        return Inertia::render('Tenant/Reports/InboundOutbound/Index', [
            'reports'    => $reports,
            'summary'    => $summary,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'per_page', 'warehouse_id', 'category_id', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Inbound_Outbound_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportInboundOutboundPdfJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the download icon in navbar.');
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Inbound_Outbound_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportInboundOutboundExcelJob::dispatch($log->id, $request->all());

        return back()->with('success', 'Added to export queue. Check the download icon in navbar.');
    }
}
