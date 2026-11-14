<?php

namespace App\Services;

use App\Contracts\StockTransferContract;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class StockTransferService implements StockTransferContract
{
    private const TRANSACTION_TYPE = 'STOCK_TRANSFER';

    public function getTransferLogsList(string $tenant_slug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $baseQuery = DB::table('transactions')
            ->leftJoin('users', 'transactions.created_by', '=', 'users.id')
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', self::TRANSACTION_TYPE);

        if (! empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $baseQuery->where(function ($q) use ($search) {
                $q->where('transactions.local_uuid', 'ilike', $search)
                    ->orWhere('transactions.notes', 'ilike', $search)
                    ->orWhereExists(function ($sub) use ($search) {
                        $sub->select(DB::raw(1))
                            ->from('transaction_items')
                            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
                            ->join('products', 'skus.product_id', '=', 'products.id')
                            ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                            ->where(function ($sq) use ($search) {
                                $sq->where('skus.sku_code', 'ilike', $search)
                                    ->orWhere('products.name', 'ilike', $search);
                            });
                    });
            });
        }

        if (! empty($filters['status'])) {
            $baseQuery->where('transactions.status', $filters['status']);
        }

        if (! empty($filters['date_from'])) {
            $baseQuery->whereDate('transactions.created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $baseQuery->whereDate('transactions.created_at', '<=', $filters['date_to']);
        }

        if (! empty($filters['from_warehouse_id'])) {
            $fromWhId = (int) $filters['from_warehouse_id'];
            $baseQuery->whereExists(function ($sub) use ($fromWhId) {
                $sub->select(DB::raw(1))
                    ->from('transaction_items')
                    ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
                    ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                    ->where('locations.warehouse_id', $fromWhId);
            });
        }

        if (! empty($filters['to_warehouse_id'])) {
            $toWhId = (int) $filters['to_warehouse_id'];
            $baseQuery->whereExists(function ($sub) use ($toWhId) {
                $sub->select(DB::raw(1))
                    ->from('transaction_items')
                    ->join('locations', 'transaction_items.to_location_id', '=', 'locations.id')
                    ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                    ->where('locations.warehouse_id', $toWhId);
            });
        }

        $paginator = (clone $baseQuery)
            ->select(
                'transactions.id',
                'transactions.local_uuid as transfer_code',
                'transactions.status',
                'transactions.notes',
                'transactions.created_at',
                'transactions.updated_at',
                'users.name as created_by_name'
            )
            ->orderByDesc('transactions.created_at')
            ->paginate(15);

        $transactionIds = collect($paginator->items())->pluck('id')->all();

        $itemsByTx = empty($transactionIds)
            ? collect()
            : DB::table('transaction_items')
                ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
                ->join('products', 'skus.product_id', '=', 'products.id')
                ->leftJoin('locations as from_loc', 'transaction_items.from_location_id', '=', 'from_loc.id')
                ->leftJoin('warehouses as from_wh', 'from_loc.warehouse_id', '=', 'from_wh.id')
                ->leftJoin('locations as to_loc', 'transaction_items.to_location_id', '=', 'to_loc.id')
                ->leftJoin('warehouses as to_wh', 'to_loc.warehouse_id', '=', 'to_wh.id')
                ->whereIn('transaction_items.transaction_id', $transactionIds)
                ->select(
                    'transaction_items.id',
                    'transaction_items.transaction_id',
                    'transaction_items.sku_id',
                    'skus.sku_code',
                    'products.name as product_name',
                    'transaction_items.from_location_id',
                    'from_loc.rack_code as from_rack_code',
                    'from_loc.zone as from_zone',
                    'from_wh.id as from_warehouse_id',
                    'from_wh.name as from_warehouse_name',
                    'transaction_items.to_location_id',
                    'to_loc.rack_code as to_rack_code',
                    'to_loc.zone as to_zone',
                    'to_wh.id as to_warehouse_id',
                    'to_wh.name as to_warehouse_name',
                    'transaction_items.quantity',
                    'transaction_items.batch_number',
                    'transaction_items.expiry_date'
                )
                ->get()
                ->groupBy('transaction_id');

        $paginator->getCollection()->transform(function ($tx) use ($itemsByTx) {
            $txItems = ($itemsByTx->get($tx->id) ?? collect())->map(fn ($item) => [
                'id'                  => (int) $item->id,
                'sku_id'              => (int) $item->sku_id,
                'sku_code'            => $item->sku_code,
                'product_name'        => $item->product_name,
                'from_location_id'    => (int) $item->from_location_id,
                'from_rack'           => $item->from_rack_code ?? '-',
                'from_warehouse_name' => $item->from_warehouse_name ?? '-',
                'to_location_id'      => (int) $item->to_location_id,
                'to_rack'             => $item->to_rack_code ?? '-',
                'to_warehouse_name'   => $item->to_warehouse_name ?? '-',
                'quantity'            => (int) $item->quantity,
                'batch_number'        => $item->batch_number,
                'expiry_date'         => $item->expiry_date,
            ])->values()->all();

            $firstItem = $txItems[0] ?? null;

            return [
                'id'                  => (int) $tx->id,
                'transfer_code'       => $tx->transfer_code,
                'status'              => $tx->status,
                'notes'               => $tx->notes,
                'created_by_name'     => $tx->created_by_name ?? '-',
                'created_at'          => $tx->created_at,
                'total_items'         => count($txItems),
                'total_quantity'      => array_sum(array_column($txItems, 'quantity')),
                'from_warehouse_name' => $firstItem['from_warehouse_name'] ?? '-',
                'to_warehouse_name'   => $firstItem['to_warehouse_name'] ?? '-',
                'from_rack'           => $firstItem['from_rack'] ?? '-',
                'to_rack'             => $firstItem['to_rack'] ?? '-',
                'items'               => $txItems,
            ];
        });

        $stats = [
            'total'     => DB::table('transactions')->where('tenant_id', $tenant->id)->where('transaction_type', self::TRANSACTION_TYPE)->count(),
            'completed' => DB::table('transactions')->where('tenant_id', $tenant->id)->where('transaction_type', self::TRANSACTION_TYPE)->where('status', 'completed')->count(),
            'pending'   => DB::table('transactions')->where('tenant_id', $tenant->id)->where('transaction_type', self::TRANSACTION_TYPE)->whereIn('status', ['pending', 'draft', 'in_transit'])->count(),
            'cancelled' => DB::table('transactions')->where('tenant_id', $tenant->id)->where('transaction_type', self::TRANSACTION_TYPE)->where('status', 'cancelled')->count(),
        ];

        return [
            'transfers' => $paginator,
            'stats'     => $stats,
        ];
    }

    public function createStockTransfer(string $tenant_slug, array $data, ?int $userId = null): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $userId ??= auth()->id();

        if (! $userId) {
            throw new RuntimeException('Authenticated user is required to create a stock transfer.');
        }

        $transferCode = 'TRF-' . now()->format('Ymd') . '-' . Str::upper(Str::random(4));

        return DB::transaction(function () use ($tenant, $data, $userId, $transferCode) {
            $transactionId = DB::table('transactions')->insertGetId([
                'tenant_id'        => $tenant->id,
                'user_id'          => $userId,
                'created_by'       => $userId,
                'local_uuid'       => $transferCode,
                'status'           => 'completed',
                'sync_status'      => 'synced',
                'transaction_type' => self::TRANSACTION_TYPE,
                'notes'            => $data['notes'] ?? null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            foreach ($data['items'] as $index => $item) {
                $skuId          = (int) $item['sku_id'];
                $fromLocationId = (int) $item['from_location_id'];
                $toLocationId   = (int) $item['to_location_id'];
                $qtyToMove      = (int) $item['quantity'];

                if ($fromLocationId === $toLocationId) {
                    throw ValidationException::withMessages([
                        "items.{$index}.to_location_id" => 'Lokasi tujuan harus berbeda dengan lokasi asal.',
                    ]);
                }

                $this->assertTenantSkuAndLocations($tenant->id, $skuId, $fromLocationId, $toLocationId, $index);

                $sourceStocks = DB::table('inventory_stocks')
                    ->where('sku_id', $skuId)
                    ->where('location_id', $fromLocationId)
                    ->where('quantity', '>', 0)
                    ->orderByRaw('expiry_date ASC NULLS LAST')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $availableQty = (int) $sourceStocks->sum('quantity');

                if ($availableQty < $qtyToMove) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => "Stok di rak asal tidak mencukupi (tersedia: {$availableQty}, diminta: {$qtyToMove}).",
                    ]);
                }

                $remainingToDeduct = $qtyToMove;
                $primaryBatch      = null;
                $primaryExpiry     = null;

                foreach ($sourceStocks as $stockRow) {
                    if ($remainingToDeduct <= 0) {
                        break;
                    }

                    $deduct = min((int) $stockRow->quantity, $remainingToDeduct);

                    if ($primaryBatch === null && $stockRow->batch_number !== null) {
                        $primaryBatch = $stockRow->batch_number;
                    }
                    if ($primaryExpiry === null && $stockRow->expiry_date !== null) {
                        $primaryExpiry = $stockRow->expiry_date;
                    }

                    DB::table('inventory_stocks')
                        ->where('id', $stockRow->id)
                        ->update([
                            'quantity'   => (int) $stockRow->quantity - $deduct,
                            'updated_at' => now(),
                        ]);

                    $this->incrementDestinationStock(
                        $skuId,
                        $toLocationId,
                        $deduct,
                        $stockRow->batch_number,
                        $stockRow->expiry_date,
                        $userId
                    );

                    $remainingToDeduct -= $deduct;
                }

                DB::table('transaction_items')->insert([
                    'transaction_id'   => $transactionId,
                    'sku_id'           => $skuId,
                    'from_location_id' => $fromLocationId,
                    'to_location_id'   => $toLocationId,
                    'quantity'         => $qtyToMove,
                    'batch_number'     => $item['batch_number'] ?? $primaryBatch,
                    'expiry_date'      => $item['expiry_date'] ?? $primaryExpiry,
                    'created_by'       => $userId,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }

            return [
                'transfer_code' => $transferCode,
                'message'       => 'Transfer stok berhasil dieksekusi.',
            ];
        });
    }

    public function updateStockTransfer(string $tenant_slug, string $transfer_code, array $data): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $transfer_code, $data) {
            $transaction = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('local_uuid', $transfer_code)
                ->where('transaction_type', self::TRANSACTION_TYPE)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw ValidationException::withMessages([
                    'transfer_code' => 'Dokumen transfer stok tidak ditemukan.',
                ]);
            }

            if (! in_array($transaction->status, ['draft', 'pending'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Hanya transfer stok berstatus draft atau pending yang dapat diperbarui.',
                ]);
            }

            foreach ($data['items'] as $index => $item) {
                $this->assertTenantSkuAndLocations(
                    $tenant->id,
                    (int) $item['sku_id'],
                    (int) $item['from_location_id'],
                    (int) $item['to_location_id'],
                    $index
                );
            }

            DB::table('transactions')
                ->where('id', $transaction->id)
                ->update([
                    'notes'      => $data['notes'] ?? $transaction->notes,
                    'updated_at' => now(),
                ]);

            DB::table('transaction_items')
                ->where('transaction_id', $transaction->id)
                ->delete();

            foreach ($data['items'] as $item) {
                DB::table('transaction_items')->insert([
                    'transaction_id'   => $transaction->id,
                    'sku_id'           => (int) $item['sku_id'],
                    'from_location_id' => (int) $item['from_location_id'],
                    'to_location_id'   => (int) $item['to_location_id'],
                    'quantity'         => (int) $item['quantity'],
                    'batch_number'     => $item['batch_number'] ?? null,
                    'expiry_date'      => $item['expiry_date'] ?? null,
                    'created_by'       => $transaction->created_by,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }

            return true;
        });
    }

    public function cancelStockTransfer(string $tenant_slug, string $transfer_code, ?int $userId = null): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $userId ??= auth()->id();

        return DB::transaction(function () use ($tenant, $transfer_code, $userId) {
            $transaction = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('local_uuid', $transfer_code)
                ->where('transaction_type', self::TRANSACTION_TYPE)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                throw ValidationException::withMessages([
                    'transfer_code' => 'Dokumen transfer stok tidak ditemukan.',
                ]);
            }

            if ($transaction->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => 'Transfer stok ini sudah dibatalkan sebelumnya.',
                ]);
            }

            if ($transaction->status === 'completed') {
                $items = DB::table('transaction_items')
                    ->where('transaction_id', $transaction->id)
                    ->lockForUpdate()
                    ->get();

                foreach ($items as $item) {
                    $qtyToReverse = (int) $item->quantity;

                    $destStocks = DB::table('inventory_stocks')
                        ->where('sku_id', $item->sku_id)
                        ->where('location_id', $item->to_location_id)
                        ->where('quantity', '>', 0)
                        ->orderByDesc('id')
                        ->lockForUpdate()
                        ->get();

                    $destAvailable = (int) $destStocks->sum('quantity');

                    if ($destAvailable < $qtyToReverse) {
                        throw ValidationException::withMessages([
                            'transfer_code' => 'Pembatalan gagal: sebagian stok di lokasi tujuan sudah keluar atau dipindahkan.',
                        ]);
                    }

                    $remaining = $qtyToReverse;
                    foreach ($destStocks as $destRow) {
                        if ($remaining <= 0) {
                            break;
                        }

                        $deduct = min((int) $destRow->quantity, $remaining);

                        DB::table('inventory_stocks')
                            ->where('id', $destRow->id)
                            ->update([
                                'quantity'   => (int) $destRow->quantity - $deduct,
                                'updated_at' => now(),
                            ]);

                        $this->incrementDestinationStock(
                            (int) $item->sku_id,
                            (int) $item->from_location_id,
                            $deduct,
                            $destRow->batch_number ?? $item->batch_number,
                            $destRow->expiry_date ?? $item->expiry_date,
                            $userId
                        );

                        $remaining -= $deduct;
                    }
                }
            }

            $cancelNote = $userId ? " [Cancelled by User ID: {$userId}]" : ' [Cancelled]';

            DB::table('transactions')
                ->where('id', $transaction->id)
                ->update([
                    'status'     => 'cancelled',
                    'notes'      => trim(($transaction->notes ?? '') . $cancelNote),
                    'updated_at' => now(),
                ]);

            return true;
        });
    }

    private function assertTenantSkuAndLocations(
        int $tenantId,
        int $skuId,
        int $fromLocationId,
        int $toLocationId,
        int $index
    ): void {
        $skuValid = DB::table('skus')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('products.tenant_id', $tenantId)
            ->where('skus.id', $skuId)
            ->where('skus.is_active', true)
            ->exists();

        if (! $skuValid) {
            throw ValidationException::withMessages([
                "items.{$index}.sku_id" => 'SKU tidak valid, nonaktif, atau bukan milik tenant ini.',
            ]);
        }

        $fromValid = DB::table('locations')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('warehouses.tenant_id', $tenantId)
            ->where('warehouses.is_active', true)
            ->where('locations.id', $fromLocationId)
            ->where('locations.is_active', true)
            ->exists();

        if (! $fromValid) {
            throw ValidationException::withMessages([
                "items.{$index}.from_location_id" => 'Lokasi rak asal tidak valid atau nonaktif.',
            ]);
        }

        $toValid = DB::table('locations')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('warehouses.tenant_id', $tenantId)
            ->where('warehouses.is_active', true)
            ->where('locations.id', $toLocationId)
            ->where('locations.is_active', true)
            ->exists();

        if (! $toValid) {
            throw ValidationException::withMessages([
                "items.{$index}.to_location_id" => 'Lokasi rak tujuan tidak valid atau nonaktif.',
            ]);
        }
    }

    private function incrementDestinationStock(
        int $skuId,
        int $locationId,
        int $quantity,
        ?string $batchNumber,
        ?string $expiryDate,
        ?int $userId
    ): void {
        $existing = DB::table('inventory_stocks')
            ->where('sku_id', $skuId)
            ->where('location_id', $locationId)
            ->when(
                $batchNumber !== null,
                fn ($q) => $q->where('batch_number', $batchNumber),
                fn ($q) => $q->whereNull('batch_number')
            )
            ->when(
                $expiryDate !== null,
                fn ($q) => $q->where('expiry_date', $expiryDate),
                fn ($q) => $q->whereNull('expiry_date')
            )
            ->lockForUpdate()
            ->first();

        if ($existing) {
            DB::table('inventory_stocks')
                ->where('id', $existing->id)
                ->update([
                    'quantity'   => (int) $existing->quantity + $quantity,
                    'updated_at' => now(),
                ]);

            return;
        }

        DB::table('inventory_stocks')->insert([
            'sku_id'       => $skuId,
            'location_id'  => $locationId,
            'quantity'     => $quantity,
            'batch_number' => $batchNumber,
            'expiry_date'  => $expiryDate,
            'created_by'   => $userId,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
    }
}
