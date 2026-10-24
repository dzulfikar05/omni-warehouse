<?php

namespace App\Services;

use App\Contracts\StockMovementReportContract;
use App\Models\Tenant;
use App\Models\TransactionItem;

class StockMovementReportService implements StockMovementReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array
    {
        $perPage         = $filters['per_page'] ?? 10;
        $search          = $filters['search'] ?? null;
        $warehouseId     = $filters['warehouse_id'] ?? null;
        $categoryId      = $filters['category_id'] ?? null;
        $transactionType = $filters['transaction_type'] ?? null;
        $dateFrom        = $filters['date_from'] ?? null;
        $dateTo          = $filters['date_to'] ?? null;
        $sortBy          = $filters['sort_by'] ?? 'created_at';
        $sortOrder       = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = TransactionItem::query()
            ->whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with(['transaction.user', 'sku.product.category', 'sku.unit', 'fromLocation.warehouse', 'toLocation.warehouse']);

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

        // Apply Sorting
        match ($sortBy) {
            'quantity' => $query->orderBy('quantity', $sortOrder),
            'transaction_type' => $query->whereHas('transaction', function ($q) use ($sortOrder) {
                $q->orderBy('transaction_type', $sortOrder);
            }),
            'sku_id' => $query->whereHas('sku', function ($q) use ($sortOrder) {
                $q->orderBy('sku_code', $sortOrder);
            }),
            'product_name' => $query->whereHas('sku.product', function ($q) use ($sortOrder) {
                $q->orderBy('name', $sortOrder);
            }),
            default => $query->orderBy('created_at', $sortOrder),
        };

        $movements = $query->paginate($perPage)->withQueryString();

        $totalTransfer = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->whereIn('transaction_type', ['TRANSFER', 'INTERNAL_TRANSFER']))->sum('quantity');

        return [
            'reports' => $movements,
            'summary' => [
                'total_internal_transfer' => (float) $totalTransfer,
                'stock_adjustment'       => 0,
                'damaged_units'          => 0,
                'reserved_stock'         => 0,
            ],
        ];
    }
}
