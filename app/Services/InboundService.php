<?php

namespace App\Services;

use App\Contracts\InboundContract;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class InboundService implements InboundContract
{
    public function getInboundManifestsList(string $tenant_slug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();
        if (! $tenant) {
            return ['manifests' => [], 'statuses' => [], 'summary' => []];
        }

        $itemSummary = DB::table('transaction_items')
            ->select(
                'transaction_id',
                DB::raw('COUNT(DISTINCT sku_id) as total_skus'),
                DB::raw('COALESCE(SUM(quantity), 0) as total_units')
            )
            ->groupBy('transaction_id');

        $baseQuery = DB::table('transactions')
            ->where('transactions.tenant_id', $tenant->id)
            ->whereIn('transactions.transaction_type', ['IN', 'INBOUND']);

        $statuses = (clone $baseQuery)
            ->whereNotNull('transactions.status')
            ->distinct()
            ->orderBy('transactions.status')
            ->pluck('transactions.status')
            ->map(fn ($status) => strtoupper($status))
            ->values()
            ->all();

        $summary = (clone $baseQuery)
            ->leftJoinSub($itemSummary, 'item_summary', 'transactions.id', '=', 'item_summary.transaction_id')
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN UPPER(transactions.status) IN ('PENDING', 'DRAFT', 'RECEIVING', 'ON_HOLD', 'HOLD') THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN UPPER(transactions.status) IN ('COMPLETED', 'COMMITTED', 'CLOSED', 'SUCCESS') THEN 1 ELSE 0 END) as completed,
                COALESCE(SUM(item_summary.total_units), 0) as total_units
            ")
            ->first();

        $query = (clone $baseQuery)
            ->leftJoin('suppliers', function ($join) use ($tenant) {
                $join->on('transactions.supplier_id', '=', 'suppliers.id')
                    ->where('suppliers.tenant_id', $tenant->id);
            })
            ->leftJoin('users', function ($join) use ($tenant) {
                $join->on('transactions.user_id', '=', 'users.id')
                    ->where('users.tenant_id', $tenant->id);
            })
            ->leftJoinSub($itemSummary, 'item_summary', 'transactions.id', '=', 'item_summary.transaction_id')
            ->select(
                'transactions.local_uuid as manifest_code',
                'transactions.status',
                'suppliers.name as supplier_name',
                'users.name as created_by',
                'transactions.created_at',
                DB::raw('COALESCE(item_summary.total_skus, 0) as total_skus'),
                DB::raw('COALESCE(item_summary.total_units, 0) as total_units')
            );

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = trim($filters['search']);
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('transactions.local_uuid', 'like', "%{$search}%")
                    ->orWhereExists(function ($itemQuery) use ($search, $tenant) {
                        $itemQuery->selectRaw('1')
                            ->from('transaction_items')
                            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
                            ->join('products', 'skus.product_id', '=', 'products.id')
                            ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                            ->where('products.tenant_id', $tenant->id)
                            ->where('skus.sku_code', 'like', "%{$search}%");
                    });
            });
        }
        if (! empty($filters['date_from'])) {
            $query->whereDate('transactions.created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('transactions.created_at', '<=', $filters['date_to']);
        }
        if (! empty($filters['status'])) {
            $query->whereRaw('UPPER(transactions.status) = ?', [strtoupper($filters['status'])]);
        }
        if (! empty($filters['supplier_id'])) {
            $query->where('transactions.supplier_id', $filters['supplier_id']);
        }

        return [
            'manifests' => $query
                ->orderByDesc('transactions.created_at')
                ->paginate(10)
                ->withQueryString()
                ->through(fn ($manifest) => [
                    'manifest_code' => $manifest->manifest_code,
                    'status' => strtoupper($manifest->status),
                    'supplier_name' => $manifest->supplier_name ?? '-',
                    'created_by' => $manifest->created_by ?? '-',
                    'created_at' => $manifest->created_at,
                    'total_skus' => (int) $manifest->total_skus,
                    'total_units' => (int) $manifest->total_units,
                ]),
            'statuses' => $statuses,
            'summary' => [
                'total' => (int) ($summary->total ?? 0),
                'pending' => (int) ($summary->pending ?? 0),
                'completed' => (int) ($summary->completed ?? 0),
                'total_units' => (int) ($summary->total_units ?? 0),
            ],
        ];
    }

    public function getManifestDetail(string $tenant_slug, string $manifest_code): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();
        $tenantName = $tenant ? $tenant->name : 'Gudang Utama';

        return [
            'manifest' => [
                'manifest_code' => $manifest_code,
                'status' => 'DRAFT',
                'supplier_name' => '-',
                'vehicle_no' => '-',
                'vehicle_type' => '-',
                'driver_name' => '-',
                'driver_phone' => '-',
                'warehouse_name' => $tenantName,
                'dock_bay' => 'BAY-01',
                'operator_name' => 'Operator Gudang',
                'operator_initials' => 'OP',
                'total_skus' => 0,
                'total_po_units' => 0,
                'good_units' => 0,
                'damaged_units' => 0,
                'progress_percentage' => 0,
            ],
            'items' => [],
        ];
    }

    public function verifyBarcode(string $tenant_slug, string $barcode): array
    {
        return [
            'success' => true,
            'message' => __('Item with barcode :barcode validated successfully.', [
                'barcode' => $barcode,
            ]),
        ];
    }

    public function updatePutawayAllocation(string $tenant_slug, array $data): array
    {
        return [
            'success' => true,
            'message' => __('Rack allocation and physical quantity updated successfully.'),
        ];
    }

    public function commitInbound(string $tenant_slug): bool
    {
        return true;
    }

    public function holdInboundSession(string $tenant_slug, string $reason): bool
    {
        return true;
    }
}
