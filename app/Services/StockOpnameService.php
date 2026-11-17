<?php

namespace App\Services;

use App\Contracts\StockOpnameContract;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StockOpnameService implements StockOpnameContract
{
    private const TRANSACTION_TYPE = 'STOCK_OPNAME';

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

        if (! $session) {
            return [
                'session' => null,
                'items'   => [],
            ];
        }

        // Ambil informasi gudang dari item pertama yang diaudit, atau fallback ke gudang aktif pertama
        $warehouse = DB::table('transaction_items')
            ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->where('transaction_items.transaction_id', $session->id)
            ->select('warehouses.name', 'warehouses.code')
            ->first();

        if (! $warehouse) {
            $warehouse = DB::table('warehouses')
                ->where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->select('name', 'code')
                ->first();
        }

        // Pemetaan kolom transaction_items:
        // quantity = system_qty (snapshot)
        // good_qty = physical_qty (hasil hitung fisik)
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

            // Blind Counting: Sembunyikan stok sistem & selisih untuk operator mobile
            if (! $isForMobile) {
                $base['system_qty']   = $systemQty;
                $base['variance_qty'] = $varianceQty;
            }

            return $base;
        });

        $totalSystem   = $rawItems->sum(fn ($i) => (int) ($i->system_qty ?? 0));
        $totalPhysical = $rawItems->sum(fn ($i) => (int) ($i->physical_qty ?? 0));
        $matchedSkus   = $rawItems->filter(fn ($i) => (int) ($i->good_qty ?? 0) === (int) ($i->quantity ?? 0))->count();
        $deficitUnits  = $rawItems->sum(fn ($i) => max(0, (int) ($i->quantity ?? 0) - (int) ($i->good_qty ?? 0)));
        $surplusUnits  = $rawItems->sum(fn ($i) => max(0, (int) ($i->good_qty ?? 0) - (int) ($i->quantity ?? 0)));

        $sessionData = [
            'id'                 => (int) $session->id,
            'session_code'       => $session->session_code,
            'status'             => $session->status,
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
        $opnameCode = 'OPN-' . now()->format('Ymd') . '-' . Str::upper(Str::random(4));

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
                'sync_status'      => 'synced',
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
                ->when(! empty($data['warehouse_id']), fn ($q) => $q->where('warehouses.id', $data['warehouse_id']))
                ->when(! empty($data['zone']) && $data['zone'] !== 'All Zones', fn ($q) => $q->where('locations.zone', $data['zone']))
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
                    'quantity'         => (int) $stock->sys_qty, // Snapshot stok sistem
                    'good_qty'         => 0,                     // Hasil hitung fisik awal
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
            if (! empty($data['item_id'])) {
                $item = DB::table('transaction_items')
                    ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                    ->where('transactions.tenant_id', $tenant->id)
                    ->where('transactions.transaction_type', self::TRANSACTION_TYPE)
                    ->where('transaction_items.id', $data['item_id'])
                    ->select('transaction_items.*')
                    ->lockForUpdate()
                    ->first();

                if (! $item) {
                    throw ValidationException::withMessages(['item_id' => 'Item opname tidak ditemukan.']);
                }

                $newQty = ! empty($data['is_increment'])
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

            // Mode 2: Scan barcode langsung dari mobile (mendukung item unlisted)
            if (! empty($data['session_id']) && ! empty($data['barcode'])) {
                $session = DB::table('transactions')
                    ->where('tenant_id', $tenant->id)
                    ->where('id', $data['session_id'])
                    ->where('transaction_type', self::TRANSACTION_TYPE)
                    ->where('status', 'COUNTING')
                    ->first();

                if (! $session) {
                    throw ValidationException::withMessages(['session_id' => 'Sesi opname tidak valid atau sudah ditutup.']);
                }

                $sku = DB::table('skus')
                    ->join('products', 'skus.product_id', '=', 'products.id')
                    ->where('products.tenant_id', $tenant->id)
                    ->where(function ($q) use ($data) {
                        $q->where('skus.barcode', $data['barcode'])
                          ->orWhere('skus.sku_code', $data['barcode']);
                    })
                    ->select('skus.id', 'skus.sku_code', 'products.name')
                    ->first();

                if (! $sku) {
                    throw ValidationException::withMessages(['barcode' => 'Barcode SKU tidak terdaftar pada tenant ini.']);
                }

                $locationId = $data['location_id'] ?? null;

                $existingItem = DB::table('transaction_items')
                    ->where('transaction_id', $session->id)
                    ->where('sku_id', $sku->id)
                    ->when($locationId, fn ($q) => $q->where('from_location_id', $locationId))
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

                // Jika barang tidak ada di snapshot awal rak, tambahkan sebagai temuan UNLISTED
                $qtyToAdd = (int) ($data['physical_qty'] ?? 1);
                DB::table('transaction_items')->insert([
                    'transaction_id'   => $session->id,
                    'sku_id'           => $sku->id,
                    'from_location_id' => $locationId,
                    'quantity'         => 0, // System qty 0 karena unlisted
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

            throw ValidationException::withMessages(['payload' => 'Parameter input penghitungan fisik tidak lengkap.']);
        });
    }

    public function submitSessionForReview(string $tenantSlug, int $sessionId): bool
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::table('transactions')
            ->where('tenant_id', $tenant->id)
            ->where('id', $sessionId)
            ->where('transaction_type', self::TRANSACTION_TYPE)
            ->where('status', 'COUNTING')
            ->update([
                'status'     => 'REVIEW',
                'updated_at' => now(),
            ]) > 0;
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

            if (! $session || $session->status === 'ADJUSTED') {
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

                        // Nol-kan baris lot duplikat di lokasi yang sama jika ada agar total akurat
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

                    // Sinkronkan total stok pada tabel master skus
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
}
