<?php

namespace App\Services;

use App\Contracts\InboundOutboundReportContract;
use App\Models\Tenant;
use App\Models\TransactionItem;

class InboundOutboundReportService implements InboundOutboundReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array
    {
        $perPage     = $filters['per_page'] ?? 10;
        $search      = $filters['search'] ?? null;
        $warehouseId = $filters['warehouse_id'] ?? null;
        $categoryId  = $filters['category_id'] ?? null;
        $status      = $filters['status'] ?? null;
        $dateFrom    = $filters['date_from'] ?? null;
        $dateTo      = $filters['date_to'] ?? null;
        $sortBy      = $filters['sort_by'] ?? 'created_at';
        $sortOrder   = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = TransactionItem::query()
            ->whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->whereIn('transaction_type', ['IN', 'OUT', 'INBOUND', 'OUTBOUND']))
            ->with(['transaction.supplier', 'transaction.customer', 'sku.product.category']);

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

        if ($status) {
            $query->whereHas('transaction', fn($tq) => $tq->where('status', $status));
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
            'status' => $query->whereHas('transaction', function ($q) use ($sortOrder) {
                $q->orderBy('status', $sortOrder);
            }),
            'transaction_id' => $query->whereHas('transaction', function ($q) use ($sortOrder) {
                $q->orderBy('local_uuid', $sortOrder);
            }),
            'sku_id' => $query->whereHas('sku', function ($q) use ($sortOrder) {
                $q->orderBy('sku_code', $sortOrder);
            }),
            'product_name' => $query->whereHas('sku.product', function ($q) use ($sortOrder) {
                $q->orderBy('name', $sortOrder);
            }),
            default => $query->orderBy('created_at', $sortOrder),
        };

        $items = $query->paginate($perPage)->withQueryString();

        $totalReceived = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->whereIn('transaction_type', ['IN', 'INBOUND']))->sum('quantity');
        $totalDispatch = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->whereIn('transaction_type', ['OUT', 'OUTBOUND']))->sum('quantity');

        return [
            'reports' => $items,
            'summary' => [
                'total_received_units' => (float) $totalReceived,
                'total_dispatch_units' => (float) $totalDispatch,
                'open_inbound_pos'     => 15,
                'open_outbound_pos'    => 22,
            ],
        ];
    }
}
