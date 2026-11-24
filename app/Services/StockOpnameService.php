<?php

namespace App\Services;

use App\Contracts\StockOpnameContract;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StockOpnameService implements StockOpnameContract
{
    private const TRANSACTION_TYPE = 'STOCK_OPNAME';

    /**
     * Helper terpusat untuk mencari sesi Stock Opname berdasarkan ID integer,
     * session_code (TX-OPN-... / OPN-YYYYMMDD-...), atau local_uuid.
     */
    private function findOpnameSession(int $tenantId, int|string $identifier, bool $lock = false)
    {
        $query = DB::table('transactions')
            ->where('tenant_id', $tenantId)
            ->where('transaction_type', self::TRANSACTION_TYPE);

        if (is_int($identifier) || ctype_digit((string) $identifier)) {
            $query->where('id', (int) $identifier);
        } else {
            $cleanCode = trim((string) $identifier);
            $query->where(function ($q) use ($cleanCode) {
                $q->where('local_uuid', $cleanCode);
                if (Schema::hasColumn('transactions', 'transaction_code')) {
                    $q->orWhere('transaction_code', $cleanCode);
                }
                if (Schema::hasColumn('transactions', 'code')) {
                    $q->orWhere('code', $cleanCode);
                }
            });
        }

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    public function getActiveSessionData(string $tenantSlug, bool $isForMobile = false, int|string|null $sessionId = null): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $session = DB::table('transactions')
            ->leftJoin('users', 'transactions.created_by', '=', 'users.id')
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', self::TRANSACTION_TYPE)
            ->select(
                'transactions.id',
                'transactions.local_uuid as session_code',
                'transactions.status',
                'transactions.dock_bay as zone',
                'transactions.warehouse_id',
                'transactions.location_id',
                'transactions.notes',
                'users.name as auditor_name',
                'transactions.created_at as cut_off_date'
            )
            ->when(
                $sessionId !== null,
                fn ($query) => $query->where('transactions.id', $sessionId),
                fn ($query) => $query->whereIn('transactions.status', ['DRAFT', 'COUNTING', 'REVIEW'])
            )
            ->latest('transactions.created_at')
            ->first();

        if (! $session) {
            return [
                'session' => null,
                'items' => [],
            ];
        }

        $location = $session->location_id
            ? DB::table('locations')
                ->where('id', $session->location_id)
                ->select('rack_code', 'zone')
                ->first()
            : null;

        $warehouse = DB::table('warehouses')
            ->where('tenant_id', $tenant->id)
            ->where('id', $session->warehouse_id)
            ->select('name', 'code')
            ->first();

        $warehouse = $warehouse ?: DB::table('transaction_items')
            ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('transaction_items.transaction_id', $session->id)
            ->where('warehouses.tenant_id', $tenant->id)
            ->select('warehouses.name', 'warehouses.code')
            ->first();

        if (! $warehouse) {
            $warehouse = DB::table('warehouses')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->select('name', 'code')
                ->first();
        }

        $rawItems = DB::table('transaction_items')
            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->leftJoin('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->where('transaction_items.transaction_id', $session->id)
            ->select(
                'transaction_items.id',
                'transaction_items.sku_id',
                'transaction_items.from_location_id as location_id',
                'skus.sku_code as sku',
                'skus.barcode',
                'products.name as product_name',
                'units.symbol as unit',
                'locations.rack_code as target_rack',
                'locations.zone as rack_zone',
                'transaction_items.quantity as system_qty',
                'transaction_items.good_qty as physical_qty',
                'transaction_items.damage_note',
                'transaction_items.batch_number',
                'transaction_items.expiry_date',
                'transaction_items.counted_at',
                'transaction_items.count_notes'
            )
            ->leftJoin('units', 'skus.unit_id', '=', 'units.id')
            ->orderBy('locations.rack_code')
            ->orderBy('skus.sku_code')
            ->get();

        $items = $rawItems->map(function ($item) use ($isForMobile) {
            $systemQty = (int) ($item->system_qty ?? 0);
            $physicalQty = (int) ($item->physical_qty ?? 0);
            $isCounted = $item->counted_at !== null;
            $varianceQty = $isCounted ? $physicalQty - $systemQty : 0;

            $base = [
                'id' => (int) $item->id,
                'sku_id' => (int) $item->sku_id,
                'location_id' => $item->location_id ? (int) $item->location_id : null,
                'sku' => $item->sku,
                'barcode' => $item->barcode ?? $item->sku,
                'name' => $item->product_name,
                'rack' => $item->target_rack ?? '-',
                'batch' => $item->batch_number ?? '-',
                'exp_date' => $item->expiry_date ?? '-',
                'unit' => $item->unit ?? 'Unit',
                'physical_qty' => $physicalQty,
                'is_counted' => $isCounted,
                'is_unlisted' => $item->damage_note === 'UNLISTED',
                'notes' => $item->count_notes,
            ];

            if (! $isForMobile) {
                $base['system_qty'] = $systemQty;
                $base['variance'] = $varianceQty;
                $base['status'] = ! $isCounted ? 'Belum dihitung' : ($varianceQty === 0 ? 'Match' : ($varianceQty < 0 ? 'Defisit' : 'Surplus'));
            }

            return $base;
        });

        // Fix bug alias kolom: gunakan system_qty & physical_qty sesuai select()
        $totalSystem = $rawItems->sum(fn ($i) => (int) ($i->system_qty ?? 0));
        $countedItems = $rawItems->filter(fn ($i) => $i->counted_at !== null);
        $totalPhysical = $countedItems->sum(fn ($i) => (int) ($i->physical_qty ?? 0));
        $matchedSkus = $countedItems->filter(fn ($i) => (int) ($i->physical_qty ?? 0) === (int) ($i->system_qty ?? 0))->count();
        $deficitUnits = $countedItems->sum(fn ($i) => max(0, (int) ($i->system_qty ?? 0) - (int) ($i->physical_qty ?? 0)));
        $surplusUnits = $countedItems->sum(fn ($i) => max(0, (int) ($i->physical_qty ?? 0) - (int) ($i->system_qty ?? 0)));
        $netVariance = $totalPhysical - $countedItems->sum(fn ($i) => (int) ($i->system_qty ?? 0));
        $legacyScope = trim((string) $session->zone);
        $locationLabel = $location
            ? $location->rack_code.($location->zone ? ' · '.$location->zone : '')
            : (in_array(strtolower($legacyScope), ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true)
                ? 'Semua lokasi'
                : 'Zona '.$legacyScope);

        $sessionData = [
            'id' => (int) $session->id,
            'session_code' => $session->session_code,
            'status' => strtoupper($session->status),
            'warehouse_id' => (int) $session->warehouse_id,
            'location_id' => $session->location_id ? (int) $session->location_id : null,
            'location_label' => $locationLabel,
            'warehouse_name' => $warehouse->name ?? $tenant->name,
            'warehouse_code' => $warehouse->code ?? 'WH-MAIN',
            'zone' => $location->zone
                ?? (in_array(strtolower($legacyScope), ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true)
                    ? 'All Zones'
                    : $session->zone),
            'auditor_name' => $session->auditor_name ?? '-',
            'auditor_avatar' => '-',
            'cut_off_date' => $session->cut_off_date,
            'total_skus' => $items->count(),
            'total_physical' => (int) $totalPhysical,
            'total_system_units' => $isForMobile ? 0 : (int) $totalSystem,
            'matched_skus' => $isForMobile ? 0 : $matchedSkus,
            'deficit_units' => $isForMobile ? 0 : (int) $deficitUnits,
            'surplus_units' => $isForMobile ? 0 : (int) $surplusUnits,
            'net_variance' => $isForMobile ? 0 : (int) $netVariance,
        ];

        return [
            'session' => $sessionData,
            'items' => $items->values()->all(),
        ];
    }

    public function getSessionData(string $tenantSlug, int $sessionId): array
    {
        return $this->getActiveSessionData($tenantSlug, false, $sessionId);
    }

    public function createSession(string $tenantSlug, array $data, ?int $userId = null): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $opnameCode = 'TX-OPN-'.Str::upper(Str::random(8));

        return DB::transaction(function () use ($tenant, $data, $userId, $opnameCode) {
            $warehouse = DB::table('warehouses')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->where('id', $data['warehouse_id'])
                ->first();

            if (! $warehouse) {
                throw ValidationException::withMessages([
                    'warehouse_id' => __('The selected warehouse is invalid.'),
                ]);
            }

            $locationInput = trim((string) ($data['location_id'] ?? 'all'));
            $location = null;
            if (strtolower($locationInput) !== 'all') {
                if (! ctype_digit($locationInput)) {
                    throw ValidationException::withMessages([
                        'location_id' => __('The selected location is invalid for this warehouse.'),
                    ]);
                }

                $location = DB::table('locations')
                    ->where('warehouse_id', $warehouse->id)
                    ->where('is_active', true)
                    ->where('id', (int) $locationInput)
                    ->first(['id', 'rack_code', 'zone']);
            }

            if (strtolower($locationInput) !== 'all' && ! $location) {
                throw ValidationException::withMessages([
                    'location_id' => __('The selected location is invalid for this warehouse.'),
                ]);
            }

            $activeSessions = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('transaction_type', self::TRANSACTION_TYPE)
                ->whereIn('status', ['DRAFT', 'COUNTING', 'REVIEW'])
                ->lockForUpdate()
                ->get([
                    'transactions.warehouse_id',
                    'transactions.location_id',
                    'transactions.dock_bay',
                    'transactions.id',
                ]);
            $legacySessionIds = $activeSessions
                ->whereNull('warehouse_id')
                ->pluck('id');
            $inferredWarehouseScopes = $legacySessionIds->isEmpty()
                ? collect()
                : DB::table('transaction_items')
                    ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
                    ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                    ->where('warehouses.tenant_id', $tenant->id)
                    ->whereIn('transaction_items.transaction_id', $legacySessionIds)
                    ->select('transaction_items.transaction_id')
                    ->selectRaw('MIN(warehouses.id) as inferred_warehouse_id')
                    ->selectRaw('COUNT(DISTINCT warehouses.id) as inferred_warehouse_count')
                    ->groupBy('transaction_items.transaction_id')
                    ->get()
                    ->keyBy('transaction_id');

            $hasOverlap = $activeSessions->contains(function ($activeSession) use ($warehouse, $location, $inferredWarehouseScopes) {
                $inferredScope = $inferredWarehouseScopes->get($activeSession->id);
                $inferredWarehouseCount = (int) ($inferredScope->inferred_warehouse_count ?? 0);
                $activeWarehouseId = $activeSession->warehouse_id
                    ?? ($inferredWarehouseCount === 1
                        ? $inferredScope->inferred_warehouse_id
                        : null);

                if (! $activeWarehouseId) {
                    return $inferredWarehouseCount > 1;
                }

                if ((int) $activeWarehouseId !== (int) $warehouse->id) {
                    return false;
                }

                if (! $location) {
                    return true;
                }

                if ($activeSession->location_id) {
                    return (int) $activeSession->location_id === (int) $location->id;
                }

                $legacyScope = strtolower(trim((string) $activeSession->dock_bay));
                if (in_array($legacyScope, ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true)) {
                    return true;
                }

                return strtolower(trim((string) $location->zone)) === $legacyScope;
            });

            if ($hasOverlap) {
                throw ValidationException::withMessages([
                    'session' => 'Sudah ada sesi opname aktif untuk gudang atau lokasi/rak ini.',
                ]);
            }

            $transactionId = DB::table('transactions')->insertGetId([
                'tenant_id' => $tenant->id,
                'user_id' => $userId,
                'created_by' => $userId,
                'local_uuid' => $opnameCode,
                'status' => 'COUNTING',
                'sync_status' => 'SYNCED',
                'transaction_type' => self::TRANSACTION_TYPE,
                'warehouse_id' => $warehouse->id,
                'location_id' => $location->id ?? null,
                'dock_bay' => $location->rack_code ?? 'Semua lokasi',
                'notes' => $data['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $stocks = DB::table('inventory_stocks')
                ->join('locations', 'inventory_stocks.location_id', '=', 'locations.id')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('warehouses.tenant_id', $tenant->id)
                ->where('warehouses.id', $warehouse->id)
                ->when($location, fn ($query) => $query->where('inventory_stocks.location_id', $location->id))
                ->select(
                    'inventory_stocks.sku_id',
                    'inventory_stocks.location_id',
                    'inventory_stocks.batch_number',
                    'inventory_stocks.expiry_date',
                    DB::raw('COALESCE(SUM(inventory_stocks.quantity), 0) as sys_qty')
                )
                ->groupBy('inventory_stocks.sku_id', 'inventory_stocks.location_id', 'inventory_stocks.batch_number', 'inventory_stocks.expiry_date')
                ->get();

            if ($stocks->isEmpty()) {
                throw ValidationException::withMessages([
                    'location_id' => 'Tidak ada stok aktif pada gudang atau lokasi/rak yang dipilih.',
                ]);
            }

            foreach ($stocks as $stock) {
                DB::table('transaction_items')->insert([
                    'transaction_id' => $transactionId,
                    'sku_id' => $stock->sku_id,
                    'from_location_id' => $stock->location_id,
                    'quantity' => (int) $stock->sys_qty,
                    'good_qty' => 0,
                    'damaged_qty' => 0,
                    'batch_number' => $stock->batch_number,
                    'expiry_date' => $stock->expiry_date,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return [
                'session_id' => $transactionId,
                'session_code' => $opnameCode,
            ];
        });
    }

    public function syncScannedSkuToSession(string $tenantSlug, int $sessionId, string $barcode, ?int $userId = null): int
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $barcode = strtolower(trim($barcode));

        return DB::transaction(function () use ($tenant, $sessionId, $barcode, $userId) {
            $session = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('id', $sessionId)
                ->where('transaction_type', self::TRANSACTION_TYPE)
                ->whereIn('status', ['DRAFT', 'COUNTING'])
                ->lockForUpdate()
                ->first();

            if (! $session) {
                throw ValidationException::withMessages([
                    'session_id' => 'Sesi opname tidak ditemukan atau sudah ditutup.',
                ]);
            }

            $sku = DB::table('skus')
                ->join('products', 'skus.product_id', '=', 'products.id')
                ->where('products.tenant_id', $tenant->id)
                ->where(function ($query) use ($barcode) {
                    $query->whereRaw('LOWER(TRIM(skus.barcode)) = ?', [$barcode])
                        ->orWhereRaw('LOWER(TRIM(skus.sku_code)) = ?', [$barcode]);
                })
                ->select('skus.id')
                ->first();

            if (! $sku) {
                throw ValidationException::withMessages([
                    'barcode' => 'Barcode atau SKU tidak terdaftar pada tenant ini.',
                ]);
            }

            $warehouseId = $session->warehouse_id ?: DB::table('transaction_items')
                ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('transaction_items.transaction_id', $session->id)
                ->where('warehouses.tenant_id', $tenant->id)
                ->value('warehouses.id');
            $warehouseId = $warehouseId ?: DB::table('warehouses')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->value('id');

            if (! $warehouseId) {
                throw ValidationException::withMessages([
                    'session_id' => 'Gudang sesi opname tidak dapat ditentukan.',
                ]);
            }

            $allZones = in_array(strtolower(trim((string) $session->dock_bay)), ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true);
            $stocksQuery = DB::table('inventory_stocks')
                ->join('locations', 'inventory_stocks.location_id', '=', 'locations.id')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('inventory_stocks.sku_id', $sku->id)
                ->where('warehouses.tenant_id', $tenant->id)
                ->where('warehouses.id', $warehouseId);

            if ($session->location_id) {
                $stocksQuery->where('inventory_stocks.location_id', $session->location_id);
            } elseif (! $allZones) {
                $stocksQuery->where('locations.zone', $session->dock_bay);
            }

            $stocks = $stocksQuery
                ->select(
                    'inventory_stocks.location_id',
                    'inventory_stocks.batch_number',
                    'inventory_stocks.expiry_date',
                    DB::raw('COALESCE(SUM(inventory_stocks.quantity), 0) as system_qty')
                )
                ->groupBy('inventory_stocks.location_id', 'inventory_stocks.batch_number', 'inventory_stocks.expiry_date')
                ->get();

            if ($stocks->isEmpty()) {
                throw ValidationException::withMessages([
                    'barcode' => 'SKU valid, tetapi tidak memiliki stok di gudang atau lokasi/rak sesi ini.',
                ]);
            }

            $added = 0;
            foreach ($stocks as $stock) {
                $itemQuery = DB::table('transaction_items')
                    ->where('transaction_id', $session->id)
                    ->where('sku_id', $sku->id)
                    ->where('from_location_id', $stock->location_id);
                $stock->batch_number === null
                    ? $itemQuery->whereNull('batch_number')
                    : $itemQuery->where('batch_number', $stock->batch_number);
                $stock->expiry_date === null
                    ? $itemQuery->whereNull('expiry_date')
                    : $itemQuery->where('expiry_date', $stock->expiry_date);

                if ($itemQuery->lockForUpdate()->exists()) {
                    continue;
                }

                DB::table('transaction_items')->insert([
                    'transaction_id' => $session->id,
                    'sku_id' => $sku->id,
                    'from_location_id' => $stock->location_id,
                    'quantity' => (int) $stock->system_qty,
                    'good_qty' => 0,
                    'damaged_qty' => 0,
                    'batch_number' => $stock->batch_number,
                    'expiry_date' => $stock->expiry_date,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $added++;
            }

            return $added;
        });
    }

    public function updateItemPhysicalQty(string $tenantSlug, array $data, ?int $userId = null): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $data, $userId) {
            // Mode 1: Update berdasarkan item_id yang sudah ada di daftar sesi
            if (! empty($data['item_id'])) {
                $item = DB::table('transaction_items')
                    ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                    ->where('transactions.tenant_id', $tenant->id)
                    ->where('transactions.transaction_type', self::TRANSACTION_TYPE)
                    ->whereIn('transactions.status', ['DRAFT', 'COUNTING'])
                    ->where('transaction_items.id', $data['item_id'])
                    ->select('transaction_items.*')
                    ->lockForUpdate()
                    ->first();

                if (! $item) {
                    throw ValidationException::withMessages([
                        'item_id' => 'Item opname tidak ditemukan atau sesi sudah dikunci.',
                    ]);
                }

                $newQty = ! empty($data['is_increment'])
                    ? ((int) $item->good_qty + (int) ($data['physical_qty'] ?? 1))
                    : (int) $data['physical_qty'];

                DB::table('transaction_items')
                    ->where('id', $item->id)
                    ->update([
                        'good_qty' => max(0, $newQty),
                        'counted_at' => now(),
                        'count_notes' => $data['notes'] ?? null,
                        'updated_at' => now(),
                    ]);

                return [
                    'success' => true,
                    'session_id' => (int) $item->transaction_id,
                    'physical_qty' => max(0, $newQty),
                    'message' => 'Kuantitas fisik berhasil diperbarui.',
                ];
            }

            // Mode 2: Scan barcode langsung dari mobile (mendukung session_id atau session_code + item unlisted)
            $sessionIdentifier = $data['session_id'] ?? $data['session_code'] ?? null;

            if (! empty($sessionIdentifier) && ! empty($data['barcode'])) {
                $session = $this->findOpnameSession($tenant->id, $sessionIdentifier, true);

                if (! $session || ! in_array(strtoupper($session->status), ['DRAFT', 'COUNTING'], true)) {
                    throw ValidationException::withMessages([
                        'session_id' => 'Sesi opname tidak valid atau sudah ditutup untuk penghitungan.',
                    ]);
                }

                $cleanBarcode = trim((string) $data['barcode']);
                $sku = DB::table('skus')
                    ->join('products', 'skus.product_id', '=', 'products.id')
                    ->where('products.tenant_id', $tenant->id)
                    ->where(function ($q) use ($cleanBarcode) {
                        $q->where('skus.barcode', $cleanBarcode)
                            ->orWhere('skus.sku_code', $cleanBarcode);
                    })
                    ->select('skus.id', 'skus.sku_code', 'products.name')
                    ->first();

                if (! $sku) {
                    throw ValidationException::withMessages([
                        'barcode' => 'Barcode SKU tidak terdaftar pada tenant ini.',
                    ]);
                }

                $locationId = $this->resolveSessionLocationId($tenant->id, $session, $data);

                $existingItem = DB::table('transaction_items')
                    ->where('transaction_id', $session->id)
                    ->where('sku_id', $sku->id)
                    ->where('from_location_id', $locationId)
                    ->lockForUpdate()
                    ->first();

                if ($existingItem) {
                    $newQty = (int) $existingItem->good_qty + (int) ($data['physical_qty'] ?? 1);
                    DB::table('transaction_items')
                        ->where('id', $existingItem->id)
                        ->update([
                            'good_qty' => $newQty,
                            'counted_at' => now(),
                            'updated_at' => now(),
                        ]);

                    return [
                        'success' => true,
                        'physical_qty' => $newQty,
                        'message' => "Scan berhasil: {$sku->name} (+1).",
                    ];
                }

                $qtyToAdd = (int) ($data['physical_qty'] ?? 1);
                DB::table('transaction_items')->insert([
                    'transaction_id' => $session->id,
                    'sku_id' => $sku->id,
                    'from_location_id' => $locationId,
                    'quantity' => 0,
                    'good_qty' => $qtyToAdd,
                    'damaged_qty' => 0,
                    'damage_note' => 'UNLISTED',
                    'counted_at' => now(),
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return [
                    'success' => true,
                    'physical_qty' => $qtyToAdd,
                    'message' => "Item baru di luar daftar dicatat: {$sku->name}.",
                ];
            }

            throw ValidationException::withMessages([
                'payload' => 'Parameter input penghitungan fisik tidak lengkap.',
            ]);
        });
    }

    public function syncOfflineOpname(string $tenantSlug, array $payload, int $userId): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $sessionIdentifier = $payload['session_id']
            ?? $payload['session_code']
            ?? $payload['local_uuid']
            ?? null;

        if (! $sessionIdentifier) {
            throw ValidationException::withMessages([
                'session_code' => 'session_id atau session_code wajib disertakan saat sinkronisasi opname.',
            ]);
        }

        $syncUuid = ! empty($payload['transaction_uuid']) ? trim($payload['transaction_uuid']) : null;
        $shouldSubmitReview = (bool) ($payload['should_submit_review'] ?? false);

        return DB::transaction(function () use ($tenant, $sessionIdentifier, $payload, $userId, $syncUuid, $shouldSubmitReview) {
            $session = $this->findOpnameSession($tenant->id, $sessionIdentifier, true);

            if (! $session) {
                throw ValidationException::withMessages([
                    'session_code' => "Sesi Stock Opname '{$sessionIdentifier}' tidak ditemukan.",
                ]);
            }

            $currentStatus = strtoupper($session->status);

            // Idempotency Guard 1: jika sesi sudah REVIEW atau ADJUSTED, jangan timpa ulang
            if (in_array($currentStatus, ['REVIEW', 'ADJUSTED'], true)) {
                return [
                    'session_id' => (int) $session->id,
                    'session_code' => $session->local_uuid,
                    'status' => $currentStatus,
                    'already_synced' => true,
                    'message' => 'Sesi Stock Opname sudah dikirim/diproses sebelumnya.',
                ];
            }

            // Idempotency Guard 2: jika sync_uuid yang sama sudah pernah diproses pada sesi ini
            if ($syncUuid && str_contains((string) ($session->notes ?? ''), "[SYNC:{$syncUuid}]")) {
                return [
                    'session_id' => (int) $session->id,
                    'session_code' => $session->local_uuid,
                    'status' => $currentStatus,
                    'already_synced' => true,
                    'message' => 'Batch sinkronisasi opname ini sudah diproses sebelumnya.',
                ];
            }

            foreach ($payload['items'] as $index => $itemData) {
                $physicalQty = max(0, (int) $itemData['physical_qty']);

                // Prioritas 1: Cocokkan berdasarkan item_id baris snapshot
                if (! empty($itemData['item_id'])) {
                    $existingById = DB::table('transaction_items')
                        ->where('transaction_id', $session->id)
                        ->where('id', (int) $itemData['item_id'])
                        ->lockForUpdate()
                        ->first();

                    if ($existingById) {
                        DB::table('transaction_items')
                            ->where('id', $existingById->id)
                            ->update([
                                'good_qty' => $physicalQty,
                                'counted_at' => now(),
                                'updated_at' => now(),
                            ]);

                        continue;
                    }
                }

                // Prioritas 2: Cocokkan berdasarkan sku_id / barcode + lokasi rak
                $skuId = ! empty($itemData['sku_id']) ? (int) $itemData['sku_id'] : null;

                if (! $skuId && ! empty($itemData['barcode'])) {
                    $cleanBarcode = trim((string) $itemData['barcode']);
                    $skuRow = DB::table('skus')
                        ->join('products', 'skus.product_id', '=', 'products.id')
                        ->where('products.tenant_id', $tenant->id)
                        ->where(function ($q) use ($cleanBarcode) {
                            $q->where('skus.barcode', $cleanBarcode)
                                ->orWhere('skus.sku_code', $cleanBarcode);
                        })
                        ->select('skus.id')
                        ->first();
                    $skuId = $skuRow ? (int) $skuRow->id : null;
                }

                if (! $skuId) {
                    throw ValidationException::withMessages([
                        "items.{$index}.sku_id" => 'SKU atau barcode pada item opname tidak valid untuk tenant ini.',
                    ]);
                }

                $skuBelongsToTenant = DB::table('skus')
                    ->join('products', 'skus.product_id', '=', 'products.id')
                    ->where('skus.id', $skuId)
                    ->where('products.tenant_id', $tenant->id)
                    ->exists();
                if (! $skuBelongsToTenant) {
                    throw ValidationException::withMessages([
                        "items.{$index}.sku_id" => 'SKU tidak terdaftar pada tenant ini.',
                    ]);
                }

                $locationId = $this->resolveSessionLocationId($tenant->id, $session, $itemData);

                $existingBySku = DB::table('transaction_items')
                    ->where('transaction_id', $session->id)
                    ->where('sku_id', $skuId)
                    ->where('from_location_id', $locationId)
                    ->lockForUpdate()
                    ->first();

                if ($existingBySku) {
                    DB::table('transaction_items')
                        ->where('id', $existingBySku->id)
                        ->update([
                            'good_qty' => $physicalQty,
                            'counted_at' => now(),
                            'updated_at' => now(),
                        ]);
                } else {
                    // Temuan barang di luar snapshot awal saat auditor melakukan scan offline (UNLISTED)
                    DB::table('transaction_items')->insert([
                        'transaction_id' => $session->id,
                        'sku_id' => $skuId,
                        'from_location_id' => $locationId,
                        'quantity' => 0,
                        'good_qty' => $physicalQty,
                        'damaged_qty' => 0,
                        'damage_note' => 'UNLISTED',
                        'counted_at' => now(),
                        'created_by' => $userId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $nextStatus = $shouldSubmitReview ? 'REVIEW' : 'COUNTING';
            $updatedNotes = $session->notes ?? '';
            if ($syncUuid) {
                $updatedNotes = trim($updatedNotes." [SYNC:{$syncUuid}]");
            }

            DB::table('transactions')
                ->where('id', $session->id)
                ->update([
                    'status' => $nextStatus,
                    'sync_status' => 'SYNCED',
                    'notes' => $updatedNotes !== '' ? $updatedNotes : null,
                    'updated_at' => now(),
                ]);

            return [
                'session_id' => (int) $session->id,
                'session_code' => $session->local_uuid,
                'status' => $nextStatus,
                'already_synced' => false,
                'message' => $shouldSubmitReview
                    ? 'Hasil opname offline tersinkronisasi dan dikirim untuk review supervisor.'
                    : 'Hasil penghitungan fisik offline berhasil disinkronkan.',
            ];
        });
    }

    public function submitSessionForReview(string $tenantSlug, int|string $sessionIdentifier): bool
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $sessionIdentifier) {
            $session = $this->findOpnameSession($tenant->id, $sessionIdentifier, true);

            if (! $session) {
                return false;
            }

            $currentStatus = strtoupper($session->status);

            // Idempotent: jika sudah REVIEW, anggap berhasil
            if ($currentStatus === 'REVIEW') {
                return true;
            }

            if (! in_array($currentStatus, ['DRAFT', 'COUNTING'], true)) {
                return false;
            }

            return DB::table('transactions')
                ->where('id', $session->id)
                ->update([
                    'status' => 'REVIEW',
                    'sync_status' => 'SYNCED',
                    'updated_at' => now(),
                ]) > 0;
        });
    }

    public function executeAdjustment(string $tenantSlug, int $sessionId, ?int $userId = null): bool
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $sessionId, $userId) {
            $session = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('id', $sessionId)
                ->where('transaction_type', self::TRANSACTION_TYPE)
                ->lockForUpdate()
                ->first();

            if (! $session || ! in_array(strtoupper($session->status), ['COUNTING', 'REVIEW'], true)) {
                return false;
            }

            $items = DB::table('transaction_items')
                ->where('transaction_id', $sessionId)
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages([
                    'session_id' => 'Sesi opname tidak memiliki item stok untuk disesuaikan.',
                ]);
            }

            if ($items->contains(fn ($item) => $item->counted_at === null)) {
                throw ValidationException::withMessages([
                    'session_id' => 'Semua item harus dihitung sebelum penyesuaian stok dijalankan.',
                ]);
            }

            if ($items->contains(fn ($item) => $item->from_location_id === null)) {
                throw ValidationException::withMessages([
                    'session_id' => 'Semua item harus memiliki lokasi gudang sebelum penyesuaian stok dijalankan.',
                ]);
            }

            foreach ($items as $item) {
                $systemQty = (int) ($item->quantity ?? 0);
                $physicalQty = (int) ($item->good_qty ?? 0);

                if ($systemQty !== $physicalQty) {
                    $stockQuery = DB::table('inventory_stocks')
                        ->where('sku_id', $item->sku_id)
                        ->where('location_id', $item->from_location_id);

                    $item->batch_number === null
                        ? $stockQuery->whereNull('batch_number')
                        : $stockQuery->where('batch_number', $item->batch_number);
                    $item->expiry_date === null
                        ? $stockQuery->whereNull('expiry_date')
                        : $stockQuery->where('expiry_date', $item->expiry_date);

                    $existingStocks = $stockQuery->orderBy('id')->lockForUpdate()->get();

                    if ($existingStocks->isNotEmpty()) {
                        $firstStock = $existingStocks->first();
                        DB::table('inventory_stocks')
                            ->where('id', $firstStock->id)
                            ->update([
                                'quantity' => $physicalQty,
                                'updated_at' => now(),
                            ]);

                        if ($existingStocks->count() > 1) {
                            DB::table('inventory_stocks')
                                ->whereIn('id', $existingStocks->skip(1)->pluck('id'))
                                ->update(['quantity' => 0, 'updated_at' => now()]);
                        }
                    } elseif ($physicalQty > 0) {
                        DB::table('inventory_stocks')->insert([
                            'sku_id' => $item->sku_id,
                            'location_id' => $item->from_location_id,
                            'quantity' => $physicalQty,
                            'batch_number' => $item->batch_number,
                            'expiry_date' => $item->expiry_date,
                            'created_by' => $userId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    $totalSkuStock = DB::table('inventory_stocks')
                        ->where('sku_id', $item->sku_id)
                        ->sum('quantity');

                    DB::table('skus')
                        ->where('id', $item->sku_id)
                        ->update([
                            'current_stock' => $totalSkuStock,
                            'updated_at' => now(),
                        ]);
                }
            }

            DB::table('transactions')
                ->where('id', $sessionId)
                ->update([
                    'status' => 'ADJUSTED',
                    'notes' => trim(($session->notes ?? '')." [Adjusted by User ID: {$userId}]"),
                    'updated_at' => now(),
                ]);

            return true;
        });
    }

    /**
     * Resolusi location_id atau target_rack dengan tetap mengunci isolasi tenant_id.
     */
    private function resolveSessionLocationId(int $tenantId, object $session, array $data): int
    {
        $rackCode = trim((string) ($data['target_rack'] ?? ''));
        $hasLocationInput = (isset($data['location_id']) && $data['location_id'] !== '')
            || ($rackCode !== '' && $rackCode !== '-');
        $requestedLocationId = $hasLocationInput
            ? $this->resolveTenantLocationId(
                $tenantId,
                $data['location_id'] ?? null,
                $data['target_rack'] ?? null
            )
            : null;

        if ($hasLocationInput && $requestedLocationId === null) {
            throw ValidationException::withMessages([
                'location_id' => 'Lokasi/rak tidak ditemukan pada tenant ini.',
            ]);
        }

        if ($session->location_id) {
            $sessionLocation = DB::table('locations')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('locations.id', $session->location_id)
                ->where('warehouses.tenant_id', $tenantId)
                ->select('locations.id', 'locations.warehouse_id')
                ->first();

            if (! $sessionLocation
                || ($session->warehouse_id && (int) $sessionLocation->warehouse_id !== (int) $session->warehouse_id)
                || ($requestedLocationId !== null && $requestedLocationId !== (int) $sessionLocation->id)) {
                throw ValidationException::withMessages([
                    'location_id' => 'Lokasi/rak tidak sesuai dengan sesi opname.',
                ]);
            }

            return (int) $sessionLocation->id;
        }

        $warehouseIds = ! empty($session->warehouse_id)
            ? collect([(int) $session->warehouse_id])
            : DB::table('transaction_items')
                ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('transaction_items.transaction_id', $session->id)
                ->where('warehouses.tenant_id', $tenantId)
                ->distinct()
                ->pluck('warehouses.id')
                ->map(fn ($id) => (int) $id);

        if ($warehouseIds->count() !== 1) {
            throw ValidationException::withMessages([
                'location_id' => 'Gudang sesi lama tidak dapat ditentukan dengan pasti.',
            ]);
        }

        if ($requestedLocationId === null) {
            throw ValidationException::withMessages([
                'location_id' => 'Pilih lokasi/rak untuk mencatat hasil scan.',
            ]);
        }

        $location = DB::table('locations')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('locations.id', $requestedLocationId)
            ->where('warehouses.tenant_id', $tenantId)
            ->where('warehouses.id', $warehouseIds->first())
            ->select('locations.id', 'locations.zone')
            ->first();

        if (! $location) {
            throw ValidationException::withMessages([
                'location_id' => 'Lokasi/rak berada di luar lingkup gudang sesi opname.',
            ]);
        }

        $legacyScope = strtolower(trim((string) $session->dock_bay));
        $allLocations = in_array($legacyScope, ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true);
        if (! $allLocations && strtolower(trim((string) $location->zone)) !== $legacyScope) {
            throw ValidationException::withMessages([
                'location_id' => 'Lokasi/rak berada di luar lingkup sesi opname.',
            ]);
        }

        return (int) $location->id;
    }

    private function resolveTenantLocationId(int $tenantId, ?int $locationId, ?string $rackCode): ?int
    {
        if (! empty($locationId)) {
            $loc = DB::table('locations')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('warehouses.tenant_id', $tenantId)
                ->where('locations.id', (int) $locationId)
                ->select('locations.id')
                ->first();

            return $loc ? (int) $loc->id : null;
        }

        if (! empty($rackCode) && trim($rackCode) !== '-') {
            $loc = DB::table('locations')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('warehouses.tenant_id', $tenantId)
                ->where('locations.rack_code', trim($rackCode))
                ->select('locations.id')
                ->first();

            return $loc ? (int) $loc->id : null;
        }

        return null;
    }
}
