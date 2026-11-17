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

    public function getActiveSessionData(string $tenantSlug, bool $isForMobile = false): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $session = DB::table('transactions')
            ->leftJoin('users', 'transactions.created_by', '=', 'users.id')
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', self::TRANSACTION_TYPE)
            ->whereIn('transactions.status', ['DRAFT', 'COUNTING', 'REVIEW'])
            ->select(
                'transactions.id',
                'transactions.local_uuid as session_code',
                'transactions.status',
                'transactions.dock_bay as zone',
                'transactions.notes',
                'users.name as auditor_name',
                'transactions.created_at as cut_off_date'
            )
            ->latest('transactions.created_at')
            ->first();

        if (!$session) {
            return [
                'session' => null,
                'items'   => [],
            ];
        }

        $warehouse = DB::table('transaction_items')
            ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('transaction_items.transaction_id', $session->id)
            ->select('warehouses.name', 'warehouses.code')
            ->first();

        if (!$warehouse) {
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
                'locations.rack_code as target_rack',
                'locations.zone as rack_zone',
                'transaction_items.quantity as system_qty',
                'transaction_items.good_qty as physical_qty',
                'transaction_items.damage_note'
            )
            ->orderBy('locations.rack_code')
            ->orderBy('skus.sku_code')
            ->get();

        $items = $rawItems->map(function ($item) use ($isForMobile) {
            $systemQty   = (int) ($item->system_qty ?? 0);
            $physicalQty = (int) ($item->physical_qty ?? 0);
            $varianceQty = $physicalQty - $systemQty;

            $base = [
                'id'           => (int) $item->id,
                'sku_id'       => (int) $item->sku_id,
                'location_id'  => $item->location_id ? (int) $item->location_id : null,
                'sku'          => $item->sku,
                'barcode'      => $item->barcode ?? $item->sku,
                'product_name' => $item->product_name,
                'target_rack'  => $item->target_rack ?? '-',
                'physical_qty' => $physicalQty,
                'is_unlisted'  => $item->damage_note === 'UNLISTED',
            ];

            if (!$isForMobile) {
                $base['system_qty']   = $systemQty;
                $base['variance_qty'] = $varianceQty;
            }

            return $base;
        });

        // Fix bug alias kolom: gunakan system_qty & physical_qty sesuai select()
        $totalSystem   = $rawItems->sum(fn($i) => (int) ($i->system_qty ?? 0));
        $totalPhysical = $rawItems->sum(fn($i) => (int) ($i->physical_qty ?? 0));
        $matchedSkus   = $rawItems->filter(fn($i) => (int) ($i->physical_qty ?? 0) === (int) ($i->system_qty ?? 0))->count();
        $deficitUnits  = $rawItems->sum(fn($i) => max(0, (int) ($i->system_qty ?? 0) - (int) ($i->physical_qty ?? 0)));
        $surplusUnits  = $rawItems->sum(fn($i) => max(0, (int) ($i->physical_qty ?? 0) - (int) ($i->system_qty ?? 0)));

        $sessionData = [
            'id'                 => (int) $session->id,
            'session_code'       => $session->session_code,
            'status'             => strtoupper($session->status),
            'warehouse_name'     => $warehouse->name ?? $tenant->name,
            'warehouse_code'     => $warehouse->code ?? 'WH-MAIN',
            'zone'               => $session->zone ?? 'All Zones',
            'auditor_name'       => $session->auditor_name ?? '-',
            'auditor_avatar'     => '-',
            'cut_off_date'       => $session->cut_off_date,
            'total_skus'         => $items->count(),
            'total_physical'     => (int) $totalPhysical,
            'total_system_units' => $isForMobile ? 0 : (int) $totalSystem,
            'matched_skus'       => $isForMobile ? 0 : $matchedSkus,
            'deficit_units'      => $isForMobile ? 0 : (int) $deficitUnits,
            'surplus_units'      => $isForMobile ? 0 : (int) $surplusUnits,
            'net_variance'       => $isForMobile ? 0 : (int) ($totalPhysical - $totalSystem),
        ];

        return [
            'session' => $sessionData,
            'items'   => $items->values()->all(),
        ];
    }

    public function createSession(string $tenantSlug, array $data, ?int $userId = null): array
    {
        $tenant     = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $opnameCode = 'TX-OPN-' . Str::upper(Str::random(8));

        return DB::transaction(function () use ($tenant, $data, $userId, $opnameCode) {
            $hasActive = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('transaction_type', self::TRANSACTION_TYPE)
                ->whereIn('status', ['DRAFT', 'COUNTING', 'REVIEW'])
                ->exists();

            if ($hasActive) {
                throw ValidationException::withMessages([
                    'session' => 'Masih terdapat sesi Stock Opname yang aktif. Selesaikan atau batalkan sesi sebelumnya terlebih dahulu.',
                ]);
            }

            $transactionId = DB::table('transactions')->insertGetId([
                'tenant_id'        => $tenant->id,
                'user_id'          => $userId,
                'created_by'       => $userId,
                'local_uuid'       => $opnameCode,
                'status'           => 'COUNTING',
                'sync_status'      => 'SYNCED',
                'transaction_type' => self::TRANSACTION_TYPE,
                'dock_bay'         => $data['zone'] ?? 'All Zones',
                'notes'            => $data['notes'] ?? null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            $stocks = DB::table('inventory_stocks')
                ->join('locations', 'inventory_stocks.location_id', '=', 'locations.id')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('warehouses.tenant_id', $tenant->id)
                ->when(!empty($data['warehouse_id']), fn($q) => $q->where('warehouses.id', $data['warehouse_id']))
                ->when(!empty($data['zone']) && $data['zone'] !== 'All Zones', fn($q) => $q->where('locations.zone', $data['zone']))
                ->select(
                    'inventory_stocks.sku_id',
                    'inventory_stocks.location_id',
                    DB::raw('COALESCE(SUM(inventory_stocks.quantity), 0) as sys_qty')
                )
                ->groupBy('inventory_stocks.sku_id', 'inventory_stocks.location_id')
                ->get();

            foreach ($stocks as $stock) {
                DB::table('transaction_items')->insert([
                    'transaction_id'   => $transactionId,
                    'sku_id'           => $stock->sku_id,
                    'from_location_id' => $stock->location_id,
                    'quantity'         => (int) $stock->sys_qty,
                    'good_qty'         => 0,
                    'damaged_qty'      => 0,
                    'created_by'       => $userId,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }

            return [
                'session_id'   => $transactionId,
                'session_code' => $opnameCode,
            ];
        });
    }

    public function updateItemPhysicalQty(string $tenantSlug, array $data, ?int $userId = null): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $data, $userId) {
            // Mode 1: Update berdasarkan item_id yang sudah ada di daftar sesi
            if (!empty($data['item_id'])) {
                $item = DB::table('transaction_items')
                    ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                    ->where('transactions.tenant_id', $tenant->id)
                    ->where('transactions.transaction_type', self::TRANSACTION_TYPE)
                    ->whereIn('transactions.status', ['DRAFT', 'COUNTING'])
                    ->where('transaction_items.id', $data['item_id'])
                    ->select('transaction_items.*')
                    ->lockForUpdate()
                    ->first();

                if (!$item) {
                    throw ValidationException::withMessages([
                        'item_id' => 'Item opname tidak ditemukan atau sesi sudah dikunci.',
                    ]);
                }

                $newQty = !empty($data['is_increment'])
                    ? ((int) $item->good_qty + (int) ($data['physical_qty'] ?? 1))
                    : (int) $data['physical_qty'];

                DB::table('transaction_items')
                    ->where('id', $item->id)
                    ->update([
                        'good_qty'   => max(0, $newQty),
                        'updated_at' => now(),
                    ]);

                return [
                    'success'      => true,
                    'physical_qty' => max(0, $newQty),
                    'message'      => 'Kuantitas fisik berhasil diperbarui.',
                ];
            }

            // Mode 2: Scan barcode langsung dari mobile (mendukung session_id atau session_code + item unlisted)
            $sessionIdentifier = $data['session_id'] ?? $data['session_code'] ?? null;

            if (!empty($sessionIdentifier) && !empty($data['barcode'])) {
                $session = $this->findOpnameSession($tenant->id, $sessionIdentifier, true);

                if (!$session || !in_array(strtoupper($session->status), ['DRAFT', 'COUNTING'], true)) {
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

                if (!$sku) {
                    throw ValidationException::withMessages([
                        'barcode' => 'Barcode SKU tidak terdaftar pada tenant ini.',
                    ]);
                }

                $locationId = $this->resolveTenantLocationId(
                    $tenant->id,
                    $data['location_id'] ?? null,
                    $data['target_rack'] ?? null
                );

                $existingItem = DB::table('transaction_items')
                    ->where('transaction_id', $session->id)
                    ->where('sku_id', $sku->id)
                    ->when($locationId !== null, fn($q) => $q->where('from_location_id', $locationId))
                    ->lockForUpdate()
                    ->first();

                if ($existingItem) {
                    $newQty = (int) $existingItem->good_qty + (int) ($data['physical_qty'] ?? 1);
                    DB::table('transaction_items')
                        ->where('id', $existingItem->id)
                        ->update([
                            'good_qty'   => $newQty,
                            'updated_at' => now(),
                        ]);

                    return [
                        'success'      => true,
                        'physical_qty' => $newQty,
                        'message'      => "Scan berhasil: {$sku->name} (+1).",
                    ];
                }

                $qtyToAdd = (int) ($data['physical_qty'] ?? 1);
                DB::table('transaction_items')->insert([
                    'transaction_id'   => $session->id,
                    'sku_id'           => $sku->id,
                    'from_location_id' => $locationId,
                    'quantity'         => 0,
                    'good_qty'         => $qtyToAdd,
                    'damaged_qty'      => 0,
                    'damage_note'      => 'UNLISTED',
                    'created_by'       => $userId,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);

                return [
                    'success'      => true,
                    'physical_qty' => $qtyToAdd,
                    'message'      => "Item baru di luar daftar dicatat: {$sku->name}.",
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

        if (!$sessionIdentifier) {
            throw ValidationException::withMessages([
                'session_code' => 'session_id atau session_code wajib disertakan saat sinkronisasi opname.',
            ]);
        }

        $syncUuid = !empty($payload['transaction_uuid']) ? trim($payload['transaction_uuid']) : null;
        $shouldSubmitReview = (bool) ($payload['should_submit_review'] ?? false);

        return DB::transaction(function () use ($tenant, $sessionIdentifier, $payload, $userId, $syncUuid, $shouldSubmitReview) {
            $session = $this->findOpnameSession($tenant->id, $sessionIdentifier, true);

            if (!$session) {
                throw ValidationException::withMessages([
                    'session_code' => "Sesi Stock Opname '{$sessionIdentifier}' tidak ditemukan.",
                ]);
            }

            $currentStatus = strtoupper($session->status);

            // Idempotency Guard 1: jika sesi sudah REVIEW atau ADJUSTED, jangan timpa ulang
            if (in_array($currentStatus, ['REVIEW', 'ADJUSTED'], true)) {
                return [
                    'session_id'     => (int) $session->id,
                    'session_code'   => $session->local_uuid,
                    'status'         => $currentStatus,
                    'already_synced' => true,
                    'message'        => 'Sesi Stock Opname sudah dikirim/diproses sebelumnya.',
                ];
            }

            // Idempotency Guard 2: jika sync_uuid yang sama sudah pernah diproses pada sesi ini
            if ($syncUuid && str_contains((string) ($session->notes ?? ''), "[SYNC:{$syncUuid}]")) {
                return [
                    'session_id'     => (int) $session->id,
                    'session_code'   => $session->local_uuid,
                    'status'         => $currentStatus,
                    'already_synced' => true,
                    'message'        => 'Batch sinkronisasi opname ini sudah diproses sebelumnya.',
                ];
            }

            foreach ($payload['items'] as $index => $itemData) {
                $physicalQty = max(0, (int) $itemData['physical_qty']);

                // Prioritas 1: Cocokkan berdasarkan item_id baris snapshot
                if (!empty($itemData['item_id'])) {
                    $existingById = DB::table('transaction_items')
                        ->where('transaction_id', $session->id)
                        ->where('id', (int) $itemData['item_id'])
                        ->lockForUpdate()
                        ->first();

                    if ($existingById) {
                        DB::table('transaction_items')
                            ->where('id', $existingById->id)
                            ->update([
                                'good_qty'   => $physicalQty,
                                'updated_at' => now(),
                            ]);
                        continue;
                    }
                }

                // Prioritas 2: Cocokkan berdasarkan sku_id / barcode + lokasi rak
                $skuId = !empty($itemData['sku_id']) ? (int) $itemData['sku_id'] : null;

                if (!$skuId && !empty($itemData['barcode'])) {
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

                if (!$skuId) {
                    throw ValidationException::withMessages([
                        "items.{$index}.sku_id" => 'SKU atau barcode pada item opname tidak valid untuk tenant ini.',
                    ]);
                }

                $locationId = $this->resolveTenantLocationId(
                    $tenant->id,
                    $itemData['location_id'] ?? null,
                    $itemData['target_rack'] ?? null
                );

                $existingBySku = DB::table('transaction_items')
                    ->where('transaction_id', $session->id)
                    ->where('sku_id', $skuId)
                    ->when($locationId !== null, fn($q) => $q->where('from_location_id', $locationId))
                    ->lockForUpdate()
                    ->first();

                if ($existingBySku) {
                    DB::table('transaction_items')
                        ->where('id', $existingBySku->id)
                        ->update([
                            'good_qty'   => $physicalQty,
                            'updated_at' => now(),
                        ]);
                } else {
                    // Temuan barang di luar snapshot awal saat auditor melakukan scan offline (UNLISTED)
                    DB::table('transaction_items')->insert([
                        'transaction_id'   => $session->id,
                        'sku_id'           => $skuId,
                        'from_location_id' => $locationId,
                        'quantity'         => 0,
                        'good_qty'         => $physicalQty,
                        'damaged_qty'      => 0,
                        'damage_note'      => 'UNLISTED',
                        'created_by'       => $userId,
                        'created_at'       => now(),
                        'updated_at'       => now(),
                    ]);
                }
            }

            $nextStatus = $shouldSubmitReview ? 'REVIEW' : 'COUNTING';
            $updatedNotes = $session->notes ?? '';
            if ($syncUuid) {
                $updatedNotes = trim($updatedNotes . " [SYNC:{$syncUuid}]");
            }

            DB::table('transactions')
                ->where('id', $session->id)
                ->update([
                    'status'      => $nextStatus,
                    'sync_status' => 'SYNCED',
                    'notes'       => $updatedNotes !== '' ? $updatedNotes : null,
                    'updated_at'  => now(),
                ]);

            return [
                'session_id'     => (int) $session->id,
                'session_code'   => $session->local_uuid,
                'status'         => $nextStatus,
                'already_synced' => false,
                'message'        => $shouldSubmitReview
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

            if (!$session) {
                return false;
            }

            $currentStatus = strtoupper($session->status);

            // Idempotent: jika sudah REVIEW, anggap berhasil
            if ($currentStatus === 'REVIEW') {
                return true;
            }

            if (!in_array($currentStatus, ['DRAFT', 'COUNTING'], true)) {
                return false;
            }

            return DB::table('transactions')
                ->where('id', $session->id)
                ->update([
                    'status'      => 'REVIEW',
                    'sync_status' => 'SYNCED',
                    'updated_at'  => now(),
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

            if (!$session || strtoupper($session->status) === 'ADJUSTED') {
                return false;
            }

            $items = DB::table('transaction_items')
                ->where('transaction_id', $sessionId)
                ->lockForUpdate()
                ->get();

            foreach ($items as $item) {
                $systemQty   = (int) ($item->quantity ?? 0);
                $physicalQty = (int) ($item->good_qty ?? 0);

                if ($systemQty !== $physicalQty && $item->from_location_id) {
                    $existingStocks = DB::table('inventory_stocks')
                        ->where('sku_id', $item->sku_id)
                        ->where('location_id', $item->from_location_id)
                        ->orderBy('id')
                        ->lockForUpdate()
                        ->get();

                    if ($existingStocks->isNotEmpty()) {
                        $firstStock = $existingStocks->first();
                        DB::table('inventory_stocks')
                            ->where('id', $firstStock->id)
                            ->update([
                                'quantity'   => $physicalQty,
                                'updated_at' => now(),
                            ]);

                        if ($existingStocks->count() > 1) {
                            DB::table('inventory_stocks')
                                ->whereIn('id', $existingStocks->skip(1)->pluck('id'))
                                ->update(['quantity' => 0, 'updated_at' => now()]);
                        }
                    } else {
                        DB::table('inventory_stocks')->insert([
                            'sku_id'      => $item->sku_id,
                            'location_id' => $item->from_location_id,
                            'quantity'    => $physicalQty,
                            'created_by'  => $userId,
                            'created_at'  => now(),
                            'updated_at'  => now(),
                        ]);
                    }

                    $totalSkuStock = DB::table('inventory_stocks')
                        ->where('sku_id', $item->sku_id)
                        ->sum('quantity');

                    DB::table('skus')
                        ->where('id', $item->sku_id)
                        ->update([
                            'current_stock' => $totalSkuStock,
                            'updated_at'    => now(),
                        ]);
                }
            }

            DB::table('transactions')
                ->where('id', $sessionId)
                ->update([
                    'status'     => 'ADJUSTED',
                    'notes'      => trim(($session->notes ?? '') . " [Adjusted by User ID: {$userId}]"),
                    'updated_at' => now(),
                ]);

            return true;
        });
    }

    /**
     * Resolusi location_id atau target_rack dengan tetap mengunci isolasi tenant_id.
     */
    private function resolveTenantLocationId(int $tenantId, ?int $locationId, ?string $rackCode): ?int
    {
        if (!empty($locationId)) {
            $loc = DB::table('locations')
                ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
                ->where('warehouses.tenant_id', $tenantId)
                ->where('locations.id', (int) $locationId)
                ->select('locations.id')
                ->first();

            return $loc ? (int) $loc->id : null;
        }

        if (!empty($rackCode) && trim($rackCode) !== '-') {
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
