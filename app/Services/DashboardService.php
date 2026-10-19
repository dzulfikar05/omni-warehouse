<?php

namespace App\Services;

use App\Contracts\DashboardContract;
use App\Models\InventoryStock;
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

        // Hitung total kuantitas dari TransactionItem ber-tipe 'inbound'
        $stockInThisMonth = TransactionItem::whereHas('transaction', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)
                ->where('type', 'inbound')
                ->whereMonth('transaction_date', now()->month)
                ->whereYear('transaction_date', now()->year);
        })->sum('quantity');

        // Hitung total kuantitas dari TransactionItem ber-tipe 'outbound'
        $stockOutThisMonth = TransactionItem::whereHas('transaction', function ($q) use ($tenantId) {
            $q->where('tenant_id', $tenantId)
                ->where('type', 'outbound')
                ->whereMonth('transaction_date', now()->month)
                ->whereYear('transaction_date', now()->year);
        })->sum('quantity');

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

        // Inbound Trend
        $inbounds = TransactionItem::select(
            DB::raw("DATE_FORMAT(transactions.transaction_date, '%Y-%m') as month_key"),
            DB::raw('SUM(transaction_items.quantity) as total_in')
        )
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.type', 'inbound')
            ->where('transactions.transaction_date', '>=', $startDate)
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        // Outbound Trend
        $outbounds = TransactionItem::select(
            DB::raw("DATE_FORMAT(transactions.transaction_date, '%Y-%m') as month_key"),
            DB::raw('SUM(transaction_items.quantity) as total_out')
        )
            ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenantId)
            ->where('transactions.type', 'outbound')
            ->where('transactions.transaction_date', '>=', $startDate)
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $trend = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $key = $date->format('Y-m');
            $label = $date->format('M Y');

            $trend[] = [
                'month' => $label,
                'in'    => (int) ($inbounds[$key]->total_in ?? 0),
                'out'   => (int) ($outbounds[$key]->total_out ?? 0),
            ];
        }

        return $trend;
    }

    public function getInboundVsOutboundComparison(int $tenantId): array
    {
        $completedInbound = Transaction::where('tenant_id', $tenantId)->where('type', 'inbound')->where('status', 'completed')->count();
        $pendingInbound   = Transaction::where('tenant_id', $tenantId)->where('type', 'inbound')->where('status', 'pending')->count();
        $completedOutbound = Transaction::where('tenant_id', $tenantId)->where('type', 'outbound')->where('status', 'completed')->count();
        $pendingOutbound   = Transaction::where('tenant_id', $tenantId)->where('type', 'outbound')->where('status', 'pending')->count();

        return [
            'inbound'  => ['completed' => $completedInbound, 'pending' => $pendingInbound],
            'outbound' => ['completed' => $completedOutbound, 'pending' => $pendingOutbound],
        ];
    }

    public function getLowStockAlerts(int $tenantId, int $limit = 5): array
    {
        return Sku::with(['product', 'unit'])
            ->whereHas('product', fn($q) => $q->where('tenant_id', $tenantId))
            ->whereColumn('current_stock', '<=', 'min_stock')
            ->orderBy('current_stock', 'asc')
            ->take($limit)
            ->get()
            ->map(fn($sku) => [
                'id'            => $sku->id,
                'sku_code'      => $sku->sku_code,
                'product_name'  => $sku->product?->name ?? 'N/A',
                'current_stock' => $sku->current_stock,
                'min_stock'     => $sku->min_stock,
                'unit'          => $sku->unit?->symbol ?? 'Pcs',
            ])
            ->toArray();
    }

    public function getRecentStockMovements(int $tenantId, int $limit = 5): array
    {
        return TransactionItem::with(['sku.product', 'transaction.user'])
            ->whereHas('transaction', fn($q) => $q->where('tenant_id', $tenantId))
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($item) => [
                'id'           => $item->id,
                'sku_code'     => $item->sku?->sku_code ?? '-',
                'product_name' => $item->sku?->product?->name ?? 'N/A',
                'type'         => $item->transaction?->type ?? 'inbound', // inbound, outbound, transfer
                'quantity'     => $item->quantity,
                'user'         => $item->transaction?->user?->name ?? 'System',
                'created_at'   => $item->created_at->diffForHumans(),
            ])
            ->toArray();
    }
}
