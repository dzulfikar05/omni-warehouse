<?php

namespace App\Services;

use App\Contracts\DashboardContract;
use App\Models\Product;
use App\Models\Sku;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;

class DashboardService implements DashboardContract
{
    public function getSummaryStats(int $tenantId): array
    {
        $totalSkus = Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenantId))->count();
        $totalProducts = Product::where('tenant_id', $tenantId)->count();

        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        // Hitung total kuantitas inbound bulan ini menggunakan transactions.created_at
        $stockInThisMonth = TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->whereIn('transactions.transaction_type', ['IN', 'INBOUND'])
            ->whereBetween('transactions.created_at', [$startOfMonth, $endOfMonth])
            ->sum(DB::raw('COALESCE(NULLIF(transaction_items.good_qty, 0), transaction_items.quantity, 0)'));

        // Hitung total kuantitas outbound bulan ini menggunakan transactions.created_at
        $stockOutThisMonth = TransactionItem::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->whereIn('transactions.transaction_type', ['OUT', 'OUTBOUND'])
            ->whereBetween('transactions.created_at', [$startOfMonth, $endOfMonth])
            ->sum(DB::raw('COALESCE(NULLIF(transaction_items.good_qty, 0), transaction_items.quantity, 0)'));

        return [
            'total_skus'           => $totalSkus,
            'total_products'       => $totalProducts,
            'stock_in_this_month'  => (int) $stockInThisMonth,
            'stock_out_this_month' => (int) $stockOutThisMonth,
        ];
    }

    public function getStockMovementTrend(int $tenantId, int $months = 6): array
    {
        $startDate = now()->subMonths($months - 1)->startOfMonth();

        $movements = TransactionItem::query()
            ->selectRaw(
                'EXTRACT(YEAR FROM transactions.created_at) as movement_year,
                EXTRACT(MONTH FROM transactions.created_at) as movement_month,
                SUM(CASE WHEN transactions.transaction_type IN (?, ?) THEN COALESCE(NULLIF(transaction_items.good_qty, 0), transaction_items.quantity, 0) ELSE 0 END) as total_in,
                SUM(CASE WHEN transactions.transaction_type IN (?, ?) THEN COALESCE(NULLIF(transaction_items.good_qty, 0), transaction_items.quantity, 0) ELSE 0 END) as total_out',
                ['IN', 'INBOUND', 'OUT', 'OUTBOUND']
            )
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->whereIn('transactions.transaction_type', ['IN', 'INBOUND', 'OUT', 'OUTBOUND'])
            ->where('transactions.created_at', '>=', $startDate)
            ->groupByRaw('EXTRACT(YEAR FROM transactions.created_at), EXTRACT(MONTH FROM transactions.created_at)')
            ->get()
            ->keyBy(fn($movement) => sprintf('%04d-%02d', (int) $movement->movement_year, (int) $movement->movement_month));

        $trend = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $label = $date->format('M Y');

            $trend[] = [
                'month' => $label,
                'in'    => (int) ($movements[$key]->total_in ?? 0),
                'out'   => (int) ($movements[$key]->total_out ?? 0),
            ];
        }

        return $trend;
    }

    public function getInboundVsOutboundComparison(int $tenantId): array
    {
        $completedStatuses = ['COMPLETED', 'COMMITTED', 'CLOSED', 'SUCCESS'];
        $pendingStatuses = ['PENDING', 'DRAFT', 'RECEIVING', 'PICKING', 'HOLD', 'ON_HOLD'];

        $completedInbound = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['IN', 'INBOUND'])
            ->whereRaw('UPPER(status) IN (?, ?, ?, ?)', $completedStatuses)
            ->count();

        $pendingInbound = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['IN', 'INBOUND'])
            ->whereRaw('UPPER(status) IN (?, ?, ?, ?, ?, ?)', $pendingStatuses)
            ->count();

        $completedOutbound = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['OUT', 'OUTBOUND'])
            ->whereRaw('UPPER(status) IN (?, ?, ?, ?)', $completedStatuses)
            ->count();

        $pendingOutbound = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['OUT', 'OUTBOUND'])
            ->whereRaw('UPPER(status) IN (?, ?, ?, ?, ?, ?)', $pendingStatuses)
            ->count();

        return [
            'inbound'  => ['completed' => $completedInbound, 'pending' => $pendingInbound],
            'outbound' => ['completed' => $completedOutbound, 'pending' => $pendingOutbound],
        ];
    }

    public function getLowStockAlerts(int $tenantId, int $limit = 5): array
    {
        $stockSubquery = DB::table('inventory_stocks')
            ->selectRaw('sku_id, SUM(quantity) as total_qty')
            ->groupBy('sku_id');

        return Sku::query()
            ->select([
                'skus.id',
                'skus.sku_code',
                'skus.min_stock',
                'products.name as product_name',
                'units.symbol as unit_symbol',
                DB::raw('COALESCE(inv.total_qty, skus.current_stock, 0) as actual_stock'),
            ])
            ->join('products', 'products.id', '=', 'skus.product_id')
            ->leftJoin('units', 'units.id', '=', 'skus.unit_id')
            ->leftJoinSub($stockSubquery, 'inv', fn($join) => $join->on('inv.sku_id', '=', 'skus.id'))
            ->where('products.tenant_id', $tenantId)
            ->where('skus.is_active', true)
            ->whereNotNull('skus.min_stock')
            ->where('skus.min_stock', '>', 0)
            ->whereRaw('COALESCE(inv.total_qty, skus.current_stock, 0) <= skus.min_stock')
            ->orderByRaw('COALESCE(inv.total_qty, skus.current_stock, 0) asc')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'id'            => (int) $row->id,
                'sku_code'      => $row->sku_code,
                'product_name'  => $row->product_name ?? 'N/A',
                'current_stock' => (int) $row->actual_stock,
                'min_stock'     => (int) $row->min_stock,
                'unit'          => $row->unit_symbol ?? 'Pcs',
            ])
            ->toArray();
    }

    public function getRecentStockMovements(int $tenantId, int $limit = 5): array
    {
        $movementTypes = [
            'IN', 'INBOUND',
            'OUT', 'OUTBOUND',
            'TRANSFER', 'STOCK_TRANSFER', 'INTERNAL_TRANSFER',
            'ADJUSTMENT', 'STOCK_OPNAME',
        ];

        return TransactionItem::with(['sku.product', 'transaction.user'])
            ->whereHas('transaction', fn($q) => $q
                ->where('tenant_id', $tenantId)
                ->whereIn('transaction_type', $movementTypes))
            ->latest('id')
            ->take($limit)
            ->get()
            ->map(function ($item) {
                $type = strtoupper($item->transaction?->transaction_type ?? '');
                $qty = ($item->good_qty ?? 0) > 0 ? $item->good_qty : ($item->quantity ?? 0);

                return [
                    'id'           => $item->id,
                    'sku_code'     => $item->sku?->sku_code ?? '-',
                    'product_name' => $item->sku?->product?->name ?? 'N/A',
                    'type'         => match ($type) {
                        'IN', 'INBOUND' => 'inbound',
                        'OUT', 'OUTBOUND' => 'outbound',
                        default => 'transfer',
                    },
                    'quantity'     => (int) $qty,
                    'user'         => $item->transaction?->user?->name ?? 'System',
                    'created_at'   => $item->created_at?->diffForHumans() ?? '-',
                ];
            })
            ->toArray();
    }
}
