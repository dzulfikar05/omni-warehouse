<?php

namespace App\Services;

use App\Contracts\StockTransferContract;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockTransferService implements StockTransferContract
{
    public function getTransferLogsList(string $tenant_slug): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();

        if (! $tenant) {
            return [
                'transfers' => [],
                'warehouses' => [],
                'locations' => [],
                'skus' => [],
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
            ->map(function ($sku) {
                return [
                    'id' => $sku->id,
                    'code' => $sku->code,
                    'name' => $sku->name,
                    'current_stock' => (int) $sku->current_stock,
                ];
            })
            ->toArray();

        // 4. Fetch Stock Transfer Transactions
        $transactions = DB::table('transactions')
            ->join('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->leftJoin('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->leftJoin('products', 'skus.product_id', '=', 'products.id')
            ->leftJoin('locations as from_loc', 'transaction_items.from_location_id', '=', 'from_loc.id')
            ->leftJoin('warehouses as from_wh', 'from_loc.warehouse_id', '=', 'from_wh.id')
            ->leftJoin('locations as to_loc', 'transaction_items.to_location_id', '=', 'to_loc.id')
            ->leftJoin('warehouses as to_wh', 'to_loc.warehouse_id', '=', 'to_wh.id')
            ->leftJoin('users', 'transactions.user_id', '=', 'users.id')
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', 'TRANSFER')
            ->select(
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
            ->get()
            ->map(function ($item) {
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
                    'created_at' => date('Y-m-d H:i', strtotime($item->created_at)),
                    'created_by' => $item->created_by ?? 'System User',
                ];
            })
            ->toArray();

        $inTransitCount = count(array_filter($transactions, fn ($t) => $t['status'] === 'IN_TRANSIT' || $t['status'] === 'PENDING'));
        $completedCount = count(array_filter($transactions, fn ($t) => $t['status'] === 'COMPLETED' || $t['status'] === 'SUCCESS'));
        $totalUnits = array_reduce($transactions, fn ($acc, $t) => $acc + $t['quantity'], 0);

        return [
            'transfers' => $transactions,
            'warehouses' => $warehouses,
            'locations' => $locations,
            'skus' => $skus,
            'summary' => [
                'total_transfers' => count($transactions),
                'in_transit' => $inTransitCount,
                'completed' => $completedCount,
                'total_units_moved' => $totalUnits,
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

            // 2. Create Transaction Item
            DB::table('transaction_items')->insert([
                'transaction_id' => $transactionId,
                'sku_id' => $data['sku_id'],
                'from_location_id' => $data['from_location_id'],
                'to_location_id' => $data['to_location_id'],
                'quantity' => $data['quantity'],
                'unit_price' => 0,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Update Inventory Stock - Deduct Origin Location
            $originStock = DB::table('inventory_stocks')
                ->where('sku_id', $data['sku_id'])
                ->where('location_id', $data['from_location_id'])
                ->first();

            if ($originStock) {
                DB::table('inventory_stocks')
                    ->where('id', $originStock->id)
                    ->decrement('quantity', $data['quantity']);
            }

            // 4. Update Inventory Stock - Add Destination Location
            $destStock = DB::table('inventory_stocks')
                ->where('sku_id', $data['sku_id'])
                ->where('location_id', $data['to_location_id'])
                ->first();

            if ($destStock) {
                DB::table('inventory_stocks')
                    ->where('id', $destStock->id)
                    ->increment('quantity', $data['quantity']);
            } else {
                DB::table('inventory_stocks')->insert([
                    'sku_id' => $data['sku_id'],
                    'location_id' => $data['to_location_id'],
                    'quantity' => $data['quantity'],
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return [
            'success' => true,
            'message' => 'Mutasi transfer stok berhasil dicatat ke database!',
        ];
    }
}
