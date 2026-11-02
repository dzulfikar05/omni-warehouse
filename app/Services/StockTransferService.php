<?php

namespace App\Services;

use App\Contracts\StockTransferContract;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockTransferService implements StockTransferContract
{
    public function getTransferLogsList(string $tenant_slug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();

        if (! $tenant) {
            return [
                'transfers' => [],
                'warehouses' => [],
                'locations' => [],
                'skus' => [],
                'statuses' => [],
                'summary' => [
                    'total_transfers' => 0,
                    'in_transit' => 0,
                    'completed' => 0,
                    'total_units_moved' => 0,
                ],
            ];
        }

        // 1. Fetch Warehouses for Tenant
        $warehouses = DB::table('warehouses')
            ->where('tenant_id', $tenant->id)
            ->select('id', 'name', 'code')
            ->get()
            ->toArray();

        // 2. Fetch Locations for Tenant (via warehouse relation)
        $locations = DB::table('locations')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('warehouses.tenant_id', $tenant->id)
            ->select('locations.id', 'locations.warehouse_id', 'locations.rack_code as code', 'locations.zone as name')
            ->get()
            ->map(function ($loc) {
                return [
                    'id' => $loc->id,
                    'warehouse_id' => $loc->warehouse_id,
                    'code' => $loc->code,
                    'name' => $loc->name ?? $loc->code,
                ];
            })
            ->toArray();

        // 3. Fetch SKUs for Tenant
        $inventoryStocks = DB::table('inventory_stocks')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('products.tenant_id', $tenant->id)
            ->where('inventory_stocks.quantity', '>', 0)
            ->select('inventory_stocks.sku_id', 'inventory_stocks.location_id', 'inventory_stocks.quantity')
            ->get();
            
        $stocksBySku = [];
        foreach ($inventoryStocks as $stock) {
            $stocksBySku[$stock->sku_id][] = [
                'location_id' => $stock->location_id,
                'quantity' => (int) $stock->quantity,
            ];
        }

        $skus = DB::table('skus')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->leftJoin('inventory_stocks', 'skus.id', '=', 'inventory_stocks.sku_id')
            ->where('products.tenant_id', $tenant->id)
            ->select(
                'skus.id',
                'skus.sku_code as code',
                'products.name',
                DB::raw('COALESCE(SUM(inventory_stocks.quantity), 0) as current_stock')
            )
            ->groupBy('skus.id', 'skus.sku_code', 'products.name')
            ->get()
            ->map(function ($sku) use ($stocksBySku) {
                return [
                    'id' => $sku->id,
                    'code' => $sku->code,
                    'name' => $sku->name,
                    'current_stock' => (int) $sku->current_stock,
                    'locations' => $stocksBySku[$sku->id] ?? [],
                ];
            })
            ->toArray();

        $statuses = DB::table('transactions')
            ->where('tenant_id', $tenant->id)
            ->where('transaction_type', 'TRANSFER')
            ->whereNotNull('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->map(fn ($status) => strtoupper($status))
            ->values()
            ->toArray();

        $summary = DB::table('transactions')
            ->join('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', 'TRANSFER')
            ->selectRaw("
                COUNT(*) as total_transfers,
                SUM(CASE WHEN UPPER(transactions.status) IN ('IN_TRANSIT', 'PENDING') THEN 1 ELSE 0 END) as in_transit,
                SUM(CASE WHEN UPPER(transactions.status) IN ('COMPLETED', 'SUCCESS') THEN 1 ELSE 0 END) as completed,
                COALESCE(SUM(transaction_items.quantity), 0) as total_units_moved
            ")
            ->first();

        // 4. Fetch Stock Transfer Transactions
        $query = DB::table('transactions')
            ->join('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->leftJoin('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->leftJoin('products', function ($join) use ($tenant) {
                $join->on('skus.product_id', '=', 'products.id')
                    ->where('products.tenant_id', $tenant->id);
            })
            ->leftJoin('locations as from_loc', 'transaction_items.from_location_id', '=', 'from_loc.id')
            ->leftJoin('warehouses as from_wh', function ($join) use ($tenant) {
                $join->on('from_loc.warehouse_id', '=', 'from_wh.id')
                    ->where('from_wh.tenant_id', $tenant->id);
            })
            ->leftJoin('locations as to_loc', 'transaction_items.to_location_id', '=', 'to_loc.id')
            ->leftJoin('warehouses as to_wh', function ($join) use ($tenant) {
                $join->on('to_loc.warehouse_id', '=', 'to_wh.id')
                    ->where('to_wh.tenant_id', $tenant->id);
            })
            ->leftJoin('users', function ($join) use ($tenant) {
                $join->on('transactions.user_id', '=', 'users.id')
                    ->where('users.tenant_id', $tenant->id);
            })
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', 'TRANSFER')
            ->whereExists(function ($locationsQuery) use ($tenant) {
                $locationsQuery->selectRaw('1')
                    ->from('locations as source_locations')
                    ->join('warehouses as source_warehouses', 'source_locations.warehouse_id', '=', 'source_warehouses.id')
                    ->whereColumn('source_locations.id', 'transaction_items.from_location_id')
                    ->where('source_warehouses.tenant_id', $tenant->id);
            })
            ->whereExists(function ($locationsQuery) use ($tenant) {
                $locationsQuery->selectRaw('1')
                    ->from('locations as destination_locations')
                    ->join('warehouses as destination_warehouses', 'destination_locations.warehouse_id', '=', 'destination_warehouses.id')
                    ->whereColumn('destination_locations.id', 'transaction_items.to_location_id')
                    ->where('destination_warehouses.tenant_id', $tenant->id);
            })
            ->whereExists(function ($skuQuery) use ($tenant) {
                $skuQuery->selectRaw('1')
                    ->from('skus as transfer_skus')
                    ->join('products as transfer_products', 'transfer_skus.product_id', '=', 'transfer_products.id')
                    ->whereColumn('transfer_skus.id', 'transaction_items.sku_id')
                    ->where('transfer_products.tenant_id', $tenant->id);
            });

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = trim($filters['search']);
            $referenceSearch = preg_replace('/^TRF-/i', '', $search);
            $query->where(function ($searchQuery) use ($search, $referenceSearch) {
                $searchQuery
                    ->where('transactions.local_uuid', 'like', "%{$search}%");

                if ($referenceSearch !== '') {
                    $searchQuery->orWhereRaw(
                        'UPPER(SUBSTR(transactions.local_uuid, 1, 8)) LIKE ?',
                        ['%' . strtoupper($referenceSearch) . '%']
                    );
                }

                $searchQuery
                    ->orWhere('skus.sku_code', 'like', "%{$search}%")
                    ->orWhere('products.name', 'like', "%{$search}%")
                    ->orWhere('from_loc.rack_code', 'like', "%{$search}%")
                    ->orWhere('to_loc.rack_code', 'like', "%{$search}%");
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
        if (! empty($filters['from_warehouse_id'])) {
            $query->where('from_loc.warehouse_id', $filters['from_warehouse_id']);
        }
        if (! empty($filters['to_warehouse_id'])) {
            $query->where('to_loc.warehouse_id', $filters['to_warehouse_id']);
        }

        $transactions = $query->select(
                'transactions.id',
                'transactions.local_uuid as transfer_code',
                'skus.sku_code',
                'products.name as product_name',
                'from_wh.name as from_warehouse',
                'from_loc.rack_code as from_location',
                'to_wh.name as to_warehouse',
                'to_loc.rack_code as to_location',
                'transaction_items.quantity',
                'transactions.status',
                'transactions.created_at',
                'users.name as created_by'
            )
            ->orderBy('transactions.created_at', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'transfer_code' => 'TRF-' . strtoupper(substr($item->transfer_code, 0, 8)),
                    'sku_code' => $item->sku_code ?? 'SKU-N/A',
                    'product_name' => $item->product_name ?? 'Item Transfer',
                    'from_warehouse' => $item->from_warehouse ?? 'Gudang Utama',
                    'from_location' => $item->from_location ?? 'RAK-ORIGIN',
                    'to_warehouse' => $item->to_warehouse ?? 'Gudang Utama',
                    'to_location' => $item->to_location ?? 'RAK-DEST',
                    'quantity' => (int) $item->quantity,
                    'status' => strtoupper($item->status),
                    'created_at' => \Carbon\Carbon::parse($item->created_at)->timezone('Asia/Jakarta')->format('Y-m-d H:i'),
                    'created_by' => $item->created_by ?? 'System User',
                ];
            });

        return [
            'transfers' => $transactions,
            'warehouses' => $warehouses,
            'locations' => $locations,
            'skus' => $skus,
            'statuses' => $statuses,
            'summary' => [
                'total_transfers' => (int) ($summary->total_transfers ?? 0),
                'in_transit' => (int) ($summary->in_transit ?? 0),
                'completed' => (int) ($summary->completed ?? 0),
                'total_units_moved' => (int) ($summary->total_units_moved ?? 0),
            ],
        ];
    }

    public function createStockTransfer(string $tenant_slug, array $data): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $userId = Auth::id() ?? 1;

        DB::transaction(function () use ($tenant, $userId, $data) {
            // 1. Create Transaction Header
            $transactionId = DB::table('transactions')->insertGetId([
                'tenant_id' => $tenant->id,
                'user_id' => $userId,
                'local_uuid' => (string) Str::uuid(),
                'status' => 'COMPLETED',
                'sync_status' => 'synced',
                'transaction_type' => 'TRANSFER',
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Loop & Process items
            foreach ($data['items'] as $item) {
                // Insert Transaction Item
                DB::table('transaction_items')->insert([
                    'transaction_id' => $transactionId,
                    'sku_id' => $item['sku_id'],
                    'from_location_id' => $item['from_location_id'],
                    'to_location_id' => $item['to_location_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => 0,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Deduct Origin Location Stock
                $originStock = DB::table('inventory_stocks')
                    ->where('sku_id', $item['sku_id'])
                    ->where('location_id', $item['from_location_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$originStock || $originStock->quantity < $item['quantity']) {
                    throw new \Exception(__('Stock is insufficient or unavailable for one of the SKUs in the source location.'));
                }

                DB::table('inventory_stocks')
                    ->where('id', $originStock->id)
                    ->decrement('quantity', $item['quantity']);

                // Increment Destination Location Stock
                $destStock = DB::table('inventory_stocks')
                    ->where('sku_id', $item['sku_id'])
                    ->where('location_id', $item['to_location_id'])
                    ->lockForUpdate()
                    ->first();

                if ($destStock) {
                    DB::table('inventory_stocks')
                        ->where('id', $destStock->id)
                        ->increment('quantity', $item['quantity']);
                } else {
                    DB::table('inventory_stocks')->insert([
                        'sku_id' => $item['sku_id'],
                        'location_id' => $item['to_location_id'],
                        'quantity' => $item['quantity'],
                        'created_by' => $userId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        return [
            'success' => true,
            'message' => __('Stock transfer batch of :count SKUs recorded successfully.', [
                'count' => count($data['items']),
            ]),
        ];
    }
}
