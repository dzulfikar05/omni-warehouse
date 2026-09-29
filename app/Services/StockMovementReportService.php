<?php

namespace App\Services;

use App\Contracts\StockMovementReportContract;
use App\Models\Tenant;
use App\Models\TransactionItem;

class StockMovementReportService implements StockMovementReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array
    {
        $perPage = $filters['per_page'] ?? 10;
        $search = $filters['search'] ?? null;
        $warehouseId = $filters['warehouse_id'] ?? null;
        $categoryId = $filters['category_id'] ?? null;
        $transactionType = $filters['transaction_type'] ?? null;
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        $query = TransactionItem::query()
            ->whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with(['transaction.user', 'sku.product.category', 'sku.unit', 'fromLocation.warehouse', 'toLocation.warehouse'])
            ->latest();

        if ($search) {
            $query->whereHas('sku', function ($q) use ($search) {
                $q->where('sku_code', 'like', "%{$search}%")
                  ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($warehouseId) {
            $query->where(function ($q) use ($warehouseId) {
                $q->whereHas('fromLocation', fn($lq) => $lq->where('warehouse_id', $warehouseId))
                  ->orWhereHas('toLocation', fn($lq) => $lq->where('warehouse_id', $warehouseId));
            });
        }

        if ($categoryId) {
            $query->whereHas('sku.product', fn($pq) => $pq->where('category_id', $categoryId));
        }

        if ($transactionType) {
            $query->whereHas('transaction', fn($tq) => $tq->where('transaction_type', $transactionType));
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $movements = $query->paginate($perPage)->withQueryString();

        $totalTransfer = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->where('transaction_type', 'TRANSFER'))->sum('quantity');

        return [
            'reports' => $movements,
            'summary' => [
                'total_internal_transfer' => $totalTransfer,
                'stock_adjustment' => 0,
                'damaged_units' => 0,
                'reserved_stock' => 0,
            ],
        ];
    }
}
