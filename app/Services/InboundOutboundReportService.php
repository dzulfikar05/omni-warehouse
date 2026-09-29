<?php

namespace App\Services;

use App\Contracts\InboundOutboundReportContract;
use App\Models\Tenant;
use App\Models\TransactionItem;

class InboundOutboundReportService implements InboundOutboundReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array
    {
        $perPage = $filters['per_page'] ?? 10;
        $search = $filters['search'] ?? null;
        $warehouseId = $filters['warehouse_id'] ?? null;
        $categoryId = $filters['category_id'] ?? null;
        $status = $filters['status'] ?? null;
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        $query = TransactionItem::query()
            ->whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->whereIn('transaction_type', ['IN', 'OUT']))
            ->with(['transaction.supplier', 'transaction.customer', 'sku.product.category'])
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

        if ($status) {
            $query->whereHas('transaction', fn($tq) => $tq->where('status', $status));
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $items = $query->paginate($perPage)->withQueryString();

        $totalReceived = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->where('transaction_type', 'IN'))->sum('quantity');
        $totalDispatch = TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->where('transaction_type', 'OUT'))->sum('quantity');

        return [
            'reports' => $items,
            'summary' => [
                'total_received_units' => $totalReceived,
                'total_dispatch_units' => $totalDispatch,
                'open_inbound_pos' => 15,
                'open_outbound_pos' => 22,
            ],
        ];
    }
}
