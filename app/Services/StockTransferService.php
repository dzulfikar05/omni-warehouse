<?php

namespace App\Services;

use App\Contracts\StockTransferContract;
use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class StockTransferService implements StockTransferContract
{
    private const TRANSACTION_TYPES = ['stock_transfer', 'transfer'];

    public function getTransferLogsList(string $tenant_slug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $itemSummary = DB::table('transaction_items')
            ->select(
                'transaction_id',
                DB::raw('COUNT(DISTINCT sku_id) as total_skus'),
                DB::raw('COALESCE(SUM(quantity), 0) as total_quantity')
            )
            ->groupBy('transaction_id');

        $baseQuery = DB::table('transactions')
            ->where('transactions.tenant_id', $tenant->id)
            ->whereIn(DB::raw('LOWER(transactions.transaction_type)'), self::TRANSACTION_TYPES);

        $query = (clone $baseQuery)
            ->leftJoinSub($itemSummary, 'item_summary', 'transactions.id', '=', 'item_summary.transaction_id')
            ->leftJoin('users', function ($join) use ($tenant) {
                $join->on(DB::raw('COALESCE(transactions.created_by, transactions.user_id)'), '=', 'users.id')
                    ->where('users.tenant_id', $tenant->id);
            });

        if (! empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($searchQuery) use ($search, $tenant) {
                $searchQuery
                    ->where('transactions.local_uuid', 'like', "%{$search}%")
                    ->orWhere('users.name', 'like', "%{$search}%")
                    ->orWhereExists(function ($itemQuery) use ($search, $tenant) {
                        $itemQuery->selectRaw('1')
                            ->from('transaction_items')
                            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
                            ->join('products', 'skus.product_id', '=', 'products.id')
                            ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                            ->where('products.tenant_id', $tenant->id)
                            ->where(function ($searchSku) use ($search) {
                                $searchSku->where('skus.sku_code', 'like', "%{$search}%")
                                    ->orWhere('products.name', 'like', "%{$search}%");
                            });
                    })
                    ->orWhereExists(function ($locationQuery) use ($search, $tenant) {
                        $locationQuery->selectRaw('1')
                            ->from('transaction_items')
                            ->join('locations as source_locations', 'transaction_items.from_location_id', '=', 'source_locations.id')
                            ->join('locations as destination_locations', 'transaction_items.to_location_id', '=', 'destination_locations.id')
                            ->join('warehouses as source_warehouses', 'source_locations.warehouse_id', '=', 'source_warehouses.id')
                            ->join('warehouses as destination_warehouses', 'destination_locations.warehouse_id', '=', 'destination_warehouses.id')
                            ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                            ->where('source_warehouses.tenant_id', $tenant->id)
                            ->where('destination_warehouses.tenant_id', $tenant->id)
                            ->where(function ($rackQuery) use ($search) {
                                $rackQuery->where('source_locations.rack_code', 'like', "%{$search}%")
                                    ->orWhere('source_locations.zone', 'like', "%{$search}%")
                                    ->orWhere('destination_locations.rack_code', 'like', "%{$search}%")
                                    ->orWhere('destination_locations.zone', 'like', "%{$search}%");
                            });
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
            $query->whereRaw('LOWER(transactions.status) = ?', [strtolower($filters['status'])]);
        }
        foreach ([
            'from_warehouse_id' => 'from_location_id',
            'to_warehouse_id' => 'to_location_id',
        ] as $filterKey => $locationColumn) {
            if (empty($filters[$filterKey])) {
                continue;
            }

            $query->whereExists(function ($itemQuery) use ($tenant, $filters, $filterKey, $locationColumn) {
                $itemQuery->selectRaw('1')
                    ->from('transaction_items')
                    ->join('locations', "transaction_items.{$locationColumn}", '=', 'locations.id')
                    ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                    ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                    ->where('warehouses.tenant_id', $tenant->id)
                    ->where('warehouses.id', $filters[$filterKey]);
            });
        }

        /** @var LengthAwarePaginator $transfers */
        $transfers = $query
            ->select(
                'transactions.id',
                'transactions.local_uuid as transfer_code',
                'transactions.status',
                'transactions.notes',
                'transactions.created_at',
                'transactions.updated_at',
                'transactions.created_by',
                'users.name as created_by_name',
                DB::raw('COALESCE(item_summary.total_skus, 0) as total_skus'),
                DB::raw('COALESCE(item_summary.total_quantity, 0) as total_quantity')
            )
            ->orderByDesc('transactions.created_at')
            ->paginate(10)
            ->withQueryString();

        $transactionIds = $transfers->getCollection()->pluck('id')->all();
        $itemsByTransaction = $this->getTransactionItems($tenant->id, $transactionIds)
            ->groupBy('transaction_id');

        $transfers->getCollection()->transform(function ($transfer) use ($itemsByTransaction) {
            return [
                'id' => (int) $transfer->id,
                'transfer_code' => $transfer->transfer_code,
                'status' => strtolower($transfer->status),
                'total_skus' => (int) $transfer->total_skus,
                'total_quantity' => (int) $transfer->total_quantity,
                'notes' => $transfer->notes,
                'created_at' => $transfer->created_at,
                'updated_at' => $transfer->updated_at,
                'created_by' => $transfer->created_by ? (int) $transfer->created_by : null,
                'created_by_name' => $transfer->created_by_name ?? __('Unknown operator'),
                'items' => $itemsByTransaction
                    ->get($transfer->id, collect())
                    ->map(function (array $item) {
                        unset($item['transaction_id']);

                        return $item;
                    })
                    ->values()
                    ->all(),
            ];
        });

        $summary = (clone $baseQuery)
            ->leftJoinSub($itemSummary, 'item_summary', 'transactions.id', '=', 'item_summary.transaction_id')
            ->selectRaw("
                COUNT(*) as total_transfers,
                SUM(CASE WHEN LOWER(transactions.status) IN ('pending', 'in_transit', 'draft') THEN 1 ELSE 0 END) as in_transit,
                SUM(CASE WHEN LOWER(transactions.status) = 'completed' THEN 1 ELSE 0 END) as completed,
                COALESCE(SUM(item_summary.total_quantity), 0) as total_units_moved
            ")
            ->first();

        $statuses = (clone $baseQuery)
            ->whereNotNull('transactions.status')
            ->distinct()
            ->orderBy('transactions.status')
            ->pluck('transactions.status')
            ->map(fn ($status) => strtolower($status))
            ->values()
            ->all();

        return [
            'transfers' => $transfers,
            'warehouses' => DB::table('warehouses')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->toArray(),
            'locations' => $this->getLocationOptions($tenant->id),
            'skus' => $this->getSkuStockOptions($tenant->id),
            'statuses' => $statuses,
            'summary' => [
                'total_transfers' => (int) ($summary->total_transfers ?? 0),
                'in_transit' => (int) ($summary->in_transit ?? 0),
                'completed' => (int) ($summary->completed ?? 0),
                'total_units_moved' => (int) ($summary->total_units_moved ?? 0),
            ],
        ];
    }

    public function createStockTransfer(string $tenant_slug, array $data, ?int $userId = null): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $userId ??= auth()->id();
        if (! $userId) {
            throw new RuntimeException(__('An authenticated operator is required to create a stock transfer.'));
        }

        $transferCode = 'TRF-'.now()->format('Ymd').'-'.Str::upper(Str::random(4));

        DB::transaction(function () use ($tenant, $data, $userId, $transferCode) {
            $transactionId = DB::table('transactions')->insertGetId([
                'tenant_id' => $tenant->id,
                'user_id' => $userId,
                'created_by' => $userId,
                'local_uuid' => $transferCode,
                'status' => 'completed',
                'sync_status' => 'synced',
                'transaction_type' => 'stock_transfer',
                'notes' => $data['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($data['items'] as $index => $item) {
                $skuId = (int) $item['sku_id'];
                $fromLocationId = (int) $item['from_location_id'];
                $toLocationId = (int) $item['to_location_id'];
                $quantity = (int) $item['quantity'];

                if ($fromLocationId === $toLocationId) {
                    $this->fail("items.{$index}.to_location_id", __('Source and destination racks must be different.'));
                }

                $this->assertSkuAndActiveLocations($tenant->id, $skuId, $fromLocationId, $toLocationId, $index);
                $this->moveQuantity(
                    $transactionId,
                    $userId,
                    $skuId,
                    $fromLocationId,
                    $toLocationId,
                    $quantity,
                    $index
                );
            }
        }, 3);

        return [
            'success' => true,
            'transfer_code' => $transferCode,
            'message' => __('Stock transfer :reference completed successfully.', ['reference' => $transferCode]),
        ];
    }

    public function updateStockTransfer(string $tenant_slug, string $transfer_code, array $data): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $transfer_code, $data) {
            $transaction = $this->findTransfer($tenant->id, $transfer_code, true);
            if (! in_array(strtolower($transaction->status), ['pending', 'draft'], true)) {
                $this->fail('transfer_code', __('Only pending or draft transfers can be edited.'));
            }

            foreach ($data['items'] as $index => $item) {
                $fromLocationId = (int) $item['from_location_id'];
                $toLocationId = (int) $item['to_location_id'];
                if ($fromLocationId === $toLocationId) {
                    $this->fail("items.{$index}.to_location_id", __('Source and destination racks must be different.'));
                }
                $this->assertSkuAndActiveLocations(
                    $tenant->id,
                    (int) $item['sku_id'],
                    $fromLocationId,
                    $toLocationId,
                    $index
                );
            }

            DB::table('transaction_items')->where('transaction_id', $transaction->id)->delete();
            foreach ($data['items'] as $item) {
                DB::table('transaction_items')->insert([
                    'transaction_id' => $transaction->id,
                    'sku_id' => $item['sku_id'],
                    'from_location_id' => $item['from_location_id'],
                    'to_location_id' => $item['to_location_id'],
                    'quantity' => $item['quantity'],
                    'batch_number' => $item['batch_number'] ?? null,
                    'expiry_date' => $item['expiry_date'] ?? null,
                    'created_by' => auth()->id(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('transactions')->where('id', $transaction->id)->update([
                'notes' => $data['notes'] ?? null,
                'updated_at' => now(),
            ]);

            return true;
        }, 3);
    }

    public function cancelStockTransfer(string $tenant_slug, string $transfer_code, ?int $userId = null): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $userId ??= auth()->id();

        return DB::transaction(function () use ($tenant, $transfer_code, $userId) {
            $transaction = $this->findTransfer($tenant->id, $transfer_code, true);
            $status = strtolower($transaction->status);
            if ($status === 'cancelled') {
                $this->fail('transfer_code', __('This stock transfer has already been cancelled.'));
            }
            if (! in_array($status, ['pending', 'draft', 'in_transit', 'completed'], true)) {
                $this->fail('transfer_code', __('This stock transfer status cannot be cancelled.'));
            }

            if ($status === 'completed') {
                $items = DB::table('transaction_items')
                    ->where('transaction_id', $transaction->id)
                    ->orderBy('sku_id')
                    ->orderBy('from_location_id')
                    ->orderBy('to_location_id')
                    ->lockForUpdate()
                    ->get();

                foreach ($items as $item) {
                    $this->reverseItem($item, (int) $userId);
                }
            }

            DB::table('transactions')->where('id', $transaction->id)->update([
                'status' => 'cancelled',
                'updated_at' => now(),
            ]);

            return true;
        }, 3);
    }

    private function moveQuantity(
        int $transactionId,
        int $userId,
        int $skuId,
        int $fromLocationId,
        int $toLocationId,
        int $quantity,
        int $itemIndex
    ): void {
        $stocks = DB::table('inventory_stocks')
            ->where('sku_id', $skuId)
            ->where('location_id', $fromLocationId)
            ->where('quantity', '>', 0)
            ->orderByRaw('expiry_date IS NULL')
            ->orderBy('expiry_date')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();
        $available = (int) $stocks->sum('quantity');
        if ($available < $quantity) {
            $this->fail(
                "items.{$itemIndex}.quantity",
                __('Requested quantity (:requested) exceeds available stock (:available) at the source rack.', [
                    'requested' => $quantity,
                    'available' => $available,
                ])
            );
        }

        $remaining = $quantity;
        foreach ($stocks as $stock) {
            if ($remaining === 0) {
                break;
            }

            $moved = min($remaining, (int) $stock->quantity);
            DB::table('inventory_stocks')->where('id', $stock->id)->decrement('quantity', $moved);

            DB::table('transaction_items')->insert([
                'transaction_id' => $transactionId,
                'sku_id' => $skuId,
                'from_location_id' => $fromLocationId,
                'to_location_id' => $toLocationId,
                'quantity' => $moved,
                'batch_number' => $stock->batch_number,
                'expiry_date' => $stock->expiry_date,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $destination = $this->findStockLot(
                $skuId,
                $toLocationId,
                $stock->batch_number,
                $stock->expiry_date,
                true
            );
            if ($destination) {
                DB::table('inventory_stocks')->where('id', $destination->id)->increment('quantity', $moved);
            } else {
                DB::table('inventory_stocks')->insert([
                    'sku_id' => $skuId,
                    'location_id' => $toLocationId,
                    'quantity' => $moved,
                    'batch_number' => $stock->batch_number,
                    'expiry_date' => $stock->expiry_date,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $remaining -= $moved;
        }

        if ($remaining > 0) {
            $this->fail("items.{$itemIndex}.quantity", __('Stock changed while the transfer was being processed.'));
        }
    }

    private function reverseItem(object $item, int $userId): void
    {
        $destinationRows = DB::table('inventory_stocks')
            ->where('sku_id', $item->sku_id)
            ->where('location_id', $item->to_location_id)
            ->where('quantity', '>', 0)
            ->when(
                $item->batch_number === null,
                fn ($query) => $query->whereNull('batch_number'),
                fn ($query) => $query->where('batch_number', $item->batch_number)
            )
            ->when(
                $item->expiry_date === null,
                fn ($query) => $query->whereNull('expiry_date'),
                fn ($query) => $query->where('expiry_date', $item->expiry_date)
            )
            ->orderBy('id')
            ->lockForUpdate()
            ->get();
        $available = (int) $destinationRows->sum('quantity');
        if ($available < (int) $item->quantity) {
            $this->fail(
                'transfer_code',
                __('Cannot cancel transfer: destination stock for batch :batch is insufficient.', [
                    'batch' => $item->batch_number ?? __('unbatched'),
                ])
            );
        }

        $remaining = (int) $item->quantity;
        foreach ($destinationRows as $row) {
            if ($remaining === 0) {
                break;
            }
            $deduction = min($remaining, (int) $row->quantity);
            DB::table('inventory_stocks')->where('id', $row->id)->decrement('quantity', $deduction);
            $remaining -= $deduction;
        }

        $source = $this->findStockLot(
            (int) $item->sku_id,
            (int) $item->from_location_id,
            $item->batch_number,
            $item->expiry_date,
            true
        );
        if ($source) {
            DB::table('inventory_stocks')->where('id', $source->id)->increment('quantity', $item->quantity);
        } else {
            DB::table('inventory_stocks')->insert([
                'sku_id' => $item->sku_id,
                'location_id' => $item->from_location_id,
                'quantity' => $item->quantity,
                'batch_number' => $item->batch_number,
                'expiry_date' => $item->expiry_date,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function assertSkuAndActiveLocations(
        int $tenantId,
        int $skuId,
        int $fromLocationId,
        int $toLocationId,
        int $itemIndex
    ): void {
        $skuBelongsToTenant = DB::table('skus')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('skus.id', $skuId)
            ->where('products.tenant_id', $tenantId)
            ->exists();
        if (! $skuBelongsToTenant) {
            $this->fail("items.{$itemIndex}.sku_id", __('Selected SKU does not belong to this tenant.'));
        }

        $locationIds = [$fromLocationId, $toLocationId];
        sort($locationIds);
        $locations = DB::table('locations')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->whereIn('locations.id', $locationIds)
            ->where('warehouses.tenant_id', $tenantId)
            ->select(
                'locations.id',
                'locations.is_active',
                'warehouses.is_active as warehouse_is_active'
            )
            ->orderBy('locations.id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');
        foreach ([
            'from' => $fromLocationId,
            'to' => $toLocationId,
        ] as $side => $locationId) {
            $location = $locations->get($locationId);
            if (! $location) {
                $this->fail("items.{$itemIndex}.{$side}_location_id", __('Selected rack does not belong to this tenant.'));
            }
            if (! $location->is_active || ! $location->warehouse_is_active) {
                $this->fail("items.{$itemIndex}.{$side}_location_id", __('Selected rack is not active.'));
            }
        }
    }

    private function findTransfer(int $tenantId, string $transferCode, bool $lock = false): object
    {
        $query = DB::table('transactions')
            ->where('tenant_id', $tenantId)
            ->where('local_uuid', $transferCode)
            ->whereIn(DB::raw('LOWER(transaction_type)'), self::TRANSACTION_TYPES);
        if ($lock) {
            $query->lockForUpdate();
        }
        $transfer = $query->first();
        abort_if(! $transfer, 404, __('Stock transfer document not found.'));

        return $transfer;
    }

    private function findStockLot(
        int $skuId,
        int $locationId,
        ?string $batchNumber,
        ?string $expiryDate,
        bool $lock = false
    ): ?object {
        $query = DB::table('inventory_stocks')
            ->where('sku_id', $skuId)
            ->where('location_id', $locationId)
            ->when(
                $batchNumber === null,
                fn ($builder) => $builder->whereNull('batch_number'),
                fn ($builder) => $builder->where('batch_number', $batchNumber)
            )
            ->when(
                $expiryDate === null,
                fn ($builder) => $builder->whereNull('expiry_date'),
                fn ($builder) => $builder->where('expiry_date', $expiryDate)
            )
            ->orderBy('id');
        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    private function getLocationOptions(int $tenantId): array
    {
        return DB::table('locations')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('warehouses.tenant_id', $tenantId)
            ->where('warehouses.is_active', true)
            ->where('locations.is_active', true)
            ->select(
                'locations.id',
                'locations.warehouse_id',
                'locations.rack_code',
                'locations.zone',
                'warehouses.name as warehouse_name',
                'locations.is_active'
            )
            ->orderBy('warehouses.name')
            ->orderBy('locations.zone')
            ->orderBy('locations.rack_code')
            ->get()
            ->map(fn ($location) => [
                'id' => (int) $location->id,
                'warehouse_id' => (int) $location->warehouse_id,
                'rack_code' => $location->rack_code,
                'zone' => $location->zone,
                'warehouse_name' => $location->warehouse_name,
                'is_active' => (bool) $location->is_active,
            ])
            ->all();
    }

    private function getSkuStockOptions(int $tenantId): array
    {
        return DB::table('skus')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->join('inventory_stocks', 'skus.id', '=', 'inventory_stocks.sku_id')
            ->join('locations', 'inventory_stocks.location_id', '=', 'locations.id')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('products.tenant_id', $tenantId)
            ->where('warehouses.is_active', true)
            ->where('locations.is_active', true)
            ->where('inventory_stocks.quantity', '>', 0)
            ->select(
                'skus.id',
                'skus.sku_code',
                'products.name as product_name',
                'inventory_stocks.location_id',
                'inventory_stocks.quantity',
                'inventory_stocks.batch_number',
                'inventory_stocks.expiry_date'
            )
            ->orderBy('products.name')
            ->orderBy('skus.sku_code')
            ->orderBy('inventory_stocks.expiry_date')
            ->get()
            ->groupBy('id')
            ->map(function (Collection $skuStocks) {
                $first = $skuStocks->first();
                $locations = $skuStocks
                    ->groupBy('location_id')
                    ->map(fn (Collection $lots) => [
                        'location_id' => (int) $lots->first()->location_id,
                        'quantity' => (int) $lots->sum('quantity'),
                        'batch_number' => null,
                        'expiry_date' => null,
                    ])
                    ->values()
                    ->all();

                return [
                    'id' => (int) $first->id,
                    'code' => $first->sku_code,
                    'name' => $first->product_name,
                    'current_stock' => (int) $skuStocks->sum('quantity'),
                    'locations' => $locations,
                ];
            })
            ->values()
            ->all();
    }

    private function getTransactionItems(int $tenantId, array $transactionIds): Collection
    {
        if ($transactionIds === []) {
            return collect();
        }

        return DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->join('locations as from_locations', 'transaction_items.from_location_id', '=', 'from_locations.id')
            ->join('locations as to_locations', 'transaction_items.to_location_id', '=', 'to_locations.id')
            ->join('warehouses as from_warehouses', 'from_locations.warehouse_id', '=', 'from_warehouses.id')
            ->join('warehouses as to_warehouses', 'to_locations.warehouse_id', '=', 'to_warehouses.id')
            ->where('transactions.tenant_id', $tenantId)
            ->whereIn('transaction_items.transaction_id', $transactionIds)
            ->where('products.tenant_id', $tenantId)
            ->where('from_warehouses.tenant_id', $tenantId)
            ->where('to_warehouses.tenant_id', $tenantId)
            ->select(
                'transaction_items.id',
                'transaction_items.transaction_id',
                'transaction_items.sku_id',
                'transaction_items.from_location_id',
                'transaction_items.to_location_id',
                'transaction_items.quantity',
                'transaction_items.batch_number',
                'transaction_items.expiry_date',
                'skus.sku_code',
                'products.name as product_name',
                'from_locations.rack_code as from_rack_code',
                'from_locations.zone as from_zone',
                'to_locations.rack_code as to_rack_code',
                'to_locations.zone as to_zone'
            )
            ->orderBy('transaction_items.id')
            ->get()
            ->map(fn ($item) => [
                'id' => (int) $item->id,
                'transaction_id' => (int) $item->transaction_id,
                'sku_id' => (int) $item->sku_id,
                'sku_code' => $item->sku_code,
                'product_name' => $item->product_name,
                'from_location_id' => (int) $item->from_location_id,
                'from_rack' => $this->formatRack($item->from_zone, $item->from_rack_code),
                'to_location_id' => (int) $item->to_location_id,
                'to_rack' => $this->formatRack($item->to_zone, $item->to_rack_code),
                'quantity' => (int) $item->quantity,
                'batch_number' => $item->batch_number,
                'expiry_date' => $item->expiry_date,
            ]);
    }

    private function formatRack(?string $zone, string $rackCode): string
    {
        return $zone ? "{$zone} - {$rackCode}" : $rackCode;
    }

    private function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }
}
