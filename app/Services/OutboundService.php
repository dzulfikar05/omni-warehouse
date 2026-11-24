<?php

namespace App\Services;

use App\Contracts\OutboundContract;
use App\Models\InventoryStock;
use App\Models\Location;
use App\Models\Sku;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OutboundService implements OutboundContract
{
    /**
     * Helper terpusat untuk mencari transaksi outbound secara konsisten
     * (mendukung prefix TX-OUT-, OUT-, maupun UUID lokal).
     */
    private function findOutboundTransaction(int $tenantId, string $manifestCode, bool $lock = false, array $with = []): ?Transaction
    {
        $cleanCode = trim($manifestCode);

        $query = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['OUT', 'OUTBOUND'])
            ->where(function ($q) use ($cleanCode) {
                $q->where('local_uuid', $cleanCode);

                if (Schema::hasColumn('transactions', 'transaction_code')) {
                    $q->orWhere('transaction_code', $cleanCode);
                }
                if (Schema::hasColumn('transactions', 'code')) {
                    $q->orWhere('code', $cleanCode);
                }
            });

        if (!empty($with)) {
            $query->with($with);
        }

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    public function getOutboundManifestsList(string $tenantSlug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $query = Transaction::where('tenant_id', $tenant->id)
            ->whereIn('transaction_type', ['OUT', 'OUTBOUND'])
            ->with(['customer:id,name', 'items.sku']);

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('local_uuid', 'LIKE', "%{$search}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'LIKE', "%{$search}%"));
            });
        }

        if (!empty($filters['status'])) {
            $status = strtoupper($filters['status']);
            if (in_array($status, ['HOLD', 'ON_HOLD'])) {
                $query->whereIn('status', ['HOLD', 'ON_HOLD']);
            } else {
                $query->whereRaw('UPPER(status) = ?', [$status]);
            }
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $paginated = $query->latest()->paginate(15);

        $manifests = $paginated->through(function ($tx) {
            $totalSkus = $tx->items->pluck('sku_id')->unique()->count();
            $totalUnits = $tx->items->sum('quantity');

            return [
                'manifest_code' => $tx->local_uuid,
                'so_number'     => $tx->local_uuid,
                'status'        => strtoupper($tx->status),
                'customer_name' => $tx->customer->name ?? '-',
                'created_by'    => (string) $tx->created_by,
                'created_at'    => $tx->created_at?->toIso8601String(),
                'total_skus'    => $totalSkus,
                'total_units'   => $totalUnits,
            ];
        });

        $summary = [
            'total'       => Transaction::where('tenant_id', $tenant->id)->whereIn('transaction_type', ['OUT', 'OUTBOUND'])->count(),
            'pending'     => Transaction::where('tenant_id', $tenant->id)->whereIn('transaction_type', ['OUT', 'OUTBOUND'])->whereIn('status', ['DRAFT', 'PICKING', 'HOLD', 'ON_HOLD'])->count(),
            'completed'   => Transaction::where('tenant_id', $tenant->id)->whereIn('transaction_type', ['OUT', 'OUTBOUND'])->whereIn('status', ['COMMITTED', 'CLOSED'])->count(),
            'total_units' => TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->whereIn('transaction_type', ['OUT', 'OUTBOUND']))->sum('quantity'),
        ];

        return [
            'manifests' => $manifests,
            'summary'   => $summary,
            'statuses'  => ['DRAFT', 'PICKING', 'ON_HOLD', 'COMMITTED', 'CLOSED'],
        ];
    }

    public function createManifest(string $tenantSlug, array $data, int $userId): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $incomingUuid = !empty($data['local_uuid']) ? trim($data['local_uuid']) : null;

        return DB::transaction(function () use ($tenant, $data, $userId, $incomingUuid) {
            // Idempotency guard jika request createManifest terkirim ulang akibat timeout
            if ($incomingUuid) {
                $existing = $this->findOutboundTransaction($tenant->id, $incomingUuid);
                if ($existing) {
                    return [
                        'manifest_code'  => $existing->local_uuid,
                        'already_synced' => true,
                    ];
                }
            }

            // Validasi ketersediaan stok fisik untuk setiap item demand SO di gudang
            foreach ($data['items'] as $item) {
                $sku = Sku::where('id', $item['sku_id'])
                    ->whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
                    ->firstOrFail();

                $requestedQty = (int) $item['so_qty'];
                $currentStock = (int) InventoryStock::where('sku_id', $sku->id)
                    ->whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id))
                    ->sum('quantity');

                if ($requestedQty > $currentStock) {
                    throw ValidationException::withMessages([
                        'items' => ["Stok barang {$sku->sku_code} ({$sku->product->name}) tidak mencukupi di rak gudang! Tersedia: {$currentStock} unit, Diminta: {$requestedQty} unit."],
                    ]);
                }
            }

            // Seragam dengan prefix TX-INB- / TX-PO-
            $manifestCode = $incomingUuid ?? ('TX-OUT-' . strtoupper(Str::random(8)));

            $transaction = Transaction::create([
                'tenant_id'        => $tenant->id,
                'user_id'          => $userId,
                'customer_id'      => $data['customer_id'],
                'local_uuid'       => $manifestCode,
                'status'           => 'PICKING',
                'sync_status'      => 'SYNCED',
                'transaction_type' => 'OUTBOUND',
                'created_by'       => $userId,
                'vehicle_no'       => $data['vehicle_no'] ?? null,
                'driver_name'      => $data['driver_name'] ?? null,
                'notes'            => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $requestedQty = (int) $item['so_qty'];

                // Auto-Suggest Source Rack: Cari rak aktif yang memiliki stok SKU ini
                $suggestedStock = InventoryStock::where('sku_id', $item['sku_id'])
                    ->where('quantity', '>', 0)
                    ->whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id))
                    ->orderByRaw("CASE WHEN quantity >= {$requestedQty} THEN 0 ELSE 1 END")
                    ->orderByDesc('quantity')
                    ->first();

                TransactionItem::create([
                    'transaction_id'   => $transaction->id,
                    'sku_id'           => $item['sku_id'],
                    'from_location_id' => $suggestedStock?->location_id,
                    'quantity'         => $requestedQty,
                    'good_qty'         => 0,
                    'damaged_qty'      => 0,
                    'created_by'       => $userId,
                ]);
            }

            return [
                'manifest_code'  => $manifestCode,
                'already_synced' => false,
            ];
        });
    }

    public function getManifestDetail(string $tenantSlug, string $manifestCode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $tx = $this->findOutboundTransaction(
            $tenant->id,
            $manifestCode,
            false,
            ['customer', 'items.sku.product', 'items.sku.unitModel', 'items.fromLocation']
        );

        if (!$tx) {
            abort(404, "Manifest outbound '{$manifestCode}' tidak ditemukan.");
        }

        $totalSkus = $tx->items->pluck('sku_id')->unique()->count();
        $totalPoUnits = (int) $tx->items->sum('quantity');
        $goodUnits = (int) $tx->items->sum('good_qty');
        $damagedUnits = (int) $tx->items->sum('damaged_qty');
        $pct = $totalPoUnits > 0 ? round((($goodUnits + $damagedUnits) / $totalPoUnits) * 100, 1) : 0;

        $manifest = [
            'manifest_code'  => $tx->local_uuid,
            'so_number'      => $tx->local_uuid,
            'status'         => strtoupper($tx->status),
            'customer_id'    => (int) ($tx->customer_id ?? 0),
            'customer_name'  => $tx->customer->name ?? '-',
            'vehicle_no'     => $tx->vehicle_no ?? '-',
            'driver_name'    => $tx->driver_name ?? '-',
            'total_skus'     => $totalSkus,
            'total_units'    => $totalPoUnits,
            'total_so_units' => $totalPoUnits,
            'total_po_units' => $totalPoUnits,
            'good_units'     => $goodUnits,
            'damaged_units'  => $damagedUnits,
            'progress_pct'   => $pct,
        ];

        $manifestSkuIds = $tx->items
            ->pluck('sku_id')
            ->filter()
            ->unique()
            ->values();

        // Ambil semua lokasi aktif milik tenant beserta relasi gudangnya dalam 1 query
        $activeLocations = Location::query()
            ->where('is_active', true)
            ->whereHas('warehouse', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with('warehouse:id,name')
            ->orderBy('warehouse_id')
            ->orderBy('rack_code')
            ->get(['id', 'warehouse_id', 'rack_code', 'zone']);

        $locationIds = $activeLocations->pluck('id');

        // Agregasi stok per kombinasi (location_id, sku_id) untuk SKU di manifes (1 query, anti N+1)
        $stockByLocationAndSku = [];
        if ($locationIds->isNotEmpty() && $manifestSkuIds->isNotEmpty()) {
            $stockRows = InventoryStock::query()
                ->selectRaw('location_id, sku_id, SUM(quantity) as total_qty')
                ->whereIn('location_id', $locationIds)
                ->whereIn('sku_id', $manifestSkuIds)
                ->whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id))
                ->groupBy('location_id', 'sku_id')
                ->get();

            foreach ($stockRows as $row) {
                $stockByLocationAndSku[(int) $row->location_id][(int) $row->sku_id] = (int) $row->total_qty;
            }
        }

        // Agregasi total seluruh stok per lokasi untuk kompatibilitas field stock_quantity (1 query)
        $totalStockByLocation = [];
        if ($locationIds->isNotEmpty()) {
            $totalStockByLocation = InventoryStock::query()
                ->selectRaw('location_id, SUM(quantity) as total_qty')
                ->whereIn('location_id', $locationIds)
                ->groupBy('location_id')
                ->pluck('total_qty', 'location_id')
                ->map(fn($qty) => (int) $qty)
                ->all();
        }

        // Agregasi total stok global per SKU di tenant untuk item detail (1 query)
        $totalStockBySku = [];
        if ($manifestSkuIds->isNotEmpty()) {
            $totalStockBySku = InventoryStock::query()
                ->selectRaw('sku_id, SUM(quantity) as total_qty')
                ->whereIn('sku_id', $manifestSkuIds)
                ->whereHas('location.warehouse', fn($q) => $q->where('tenant_id', $tenant->id))
                ->groupBy('sku_id')
                ->pluck('total_qty', 'sku_id')
                ->map(fn($qty) => (int) $qty)
                ->all();
        }

        $locations = $activeLocations->map(function ($loc) use ($manifestSkuIds, $stockByLocationAndSku, $totalStockByLocation) {
            $stockBySku = [];
            foreach ($manifestSkuIds as $skuId) {
                $stockBySku[(string) $skuId] = $stockByLocationAndSku[(int) $loc->id][(int) $skuId] ?? 0;
            }

            return [
                'id'             => $loc->id,
                'rack_code'      => $loc->rack_code,
                'zone'           => $loc->zone,
                'warehouse_id'   => (int) $loc->warehouse_id,
                'warehouse_name' => $loc->warehouse->name ?? '-',
                'stock_by_sku'   => $stockBySku,
                'stock_quantity' => $totalStockByLocation[(int) $loc->id] ?? 0,
            ];
        })->values();

        $items = $tx->items->map(function ($ti) use ($stockByLocationAndSku, $totalStockBySku) {
            $status = 'pending';
            $statusLabel = 'Pending Picking';

            if (($ti->good_qty + $ti->damaged_qty) >= $ti->quantity) {
                $status = $ti->damaged_qty > 0 ? 'issue' : 'valid';
                $statusLabel = $ti->damaged_qty > 0 ? 'Ada Cacat/Selisih' : 'Selesai Pick';
            } elseif ($ti->good_qty > 0 || $ti->damaged_qty > 0) {
                $status = 'process';
                $statusLabel = 'Dalam Process Pick';
            }

            $rackStock = 0;
            if ($ti->from_location_id) {
                $rackStock = $stockByLocationAndSku[(int) $ti->from_location_id][(int) $ti->sku_id]
                    ?? (int) InventoryStock::where('sku_id', $ti->sku_id)
                        ->where('location_id', $ti->from_location_id)
                        ->sum('quantity');
            }

            return [
                'id'             => $ti->id,
                'sku_id'         => $ti->sku_id,
                'sku'            => $ti->sku->sku_code ?? '-',
                'barcode'        => $ti->sku->barcode ?? $ti->sku->sku_code ?? '-',
                'product_name'   => $ti->sku->product->name ?? '-',
                'category'       => '-',
                'batch_no'       => $ti->batch_number ?? '-',
                'exp_date'       => $ti->expiry_date ? $ti->expiry_date->format('Y-m-d') : '-',
                'quantity'       => $ti->quantity,
                'so_qty'         => $ti->quantity,
                'order_qty'      => $ti->quantity,
                'po_qty'         => $ti->quantity,
                'good_qty'       => $ti->good_qty,
                'damaged_qty'    => $ti->damaged_qty,
                'unit'           => $ti->sku->unitModel->symbol ?? 'PCS',
                'source_rack'    => $ti->fromLocation->rack_code ?? null,
                'target_rack'    => $ti->fromLocation->rack_code ?? null,
                'source_rack_id' => $ti->from_location_id,
                'rack_stock'     => $rackStock,
                'current_stock'  => $totalStockBySku[(int) $ti->sku_id] ?? 0,
                'damage_note'    => $ti->damage_note,
                'status'         => $status,
                'status_label'   => $statusLabel,
            ];
        });

        return [
            'manifest'  => $manifest,
            'items'     => $items,
            'locations' => $locations,
        ];
    }

    public function verifyBarcode(string $tenantSlug, string $manifestCode, string $barcode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $cleanBarcode = trim($barcode);

        return DB::transaction(function () use ($tenant, $manifestCode, $cleanBarcode) {
            $tx = $this->findOutboundTransaction($tenant->id, $manifestCode, true);

            if (!$tx) {
                return ['success' => false, 'message' => "Manifest '{$manifestCode}' tidak ditemukan."];
            }

            $currentStatus = strtoupper($tx->status);
            if (in_array($currentStatus, ['COMMITTED', 'CLOSED', 'CANCELLED'])) {
                return ['success' => false, 'message' => "Outbound dikunci dengan status '{$currentStatus}'."];
            }

            $sku = Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
                ->where(function ($q) use ($cleanBarcode) {
                    $q->where('barcode', $cleanBarcode)
                        ->orWhere('sku_code', $cleanBarcode);
                })
                ->first();

            if (!$sku) {
                return ['success' => false, 'message' => 'Barcode/SKU tidak ditemukan pada database tenant!'];
            }

            $item = TransactionItem::where('transaction_id', $tx->id)
                ->where('sku_id', $sku->id)
                ->lockForUpdate()
                ->first();

            if (!$item) {
                return ['success' => false, 'message' => 'SKU ini tidak terdaftar pada Manifest Outbound ini!'];
            }

            if (($item->good_qty + $item->damaged_qty) >= $item->quantity) {
                return ['success' => false, 'message' => 'Kuantitas pesanan SKU ini sudah terpenuhi!'];
            }

            $item->increment('good_qty');

            if (in_array($currentStatus, ['DRAFT', 'PENDING'])) {
                $tx->status = 'PICKING';
                $tx->save();
            }

            return ['success' => true, 'message' => "Scan Berhasil: {$sku->sku_code} kuantitas picking bertambah 1."];
        });
    }

    public function updatePickingAllocation(string $tenantSlug, array $data): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $item = TransactionItem::where('id', $data['item_id'])
            ->whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with('transaction')
            ->first();

        if (!$item) {
            abort(404, 'Item outbound tidak ditemukan pada tenant ini.');
        }

        if (strtoupper($item->transaction->status) === 'COMMITTED') {
            abort(422, 'Manifest sudah di-commit dan tidak dapat diubah.');
        }

        if (!empty($data['source_rack_id'])) {
            $location = Location::where('id', $data['source_rack_id'])
                ->where('is_active', true)
                ->whereHas('warehouse', fn($q) => $q->where('tenant_id', $tenant->id))
                ->first();

            if (!$location) {
                abort(422, 'Lokasi rak asal tidak valid atau tidak aktif untuk tenant ini.');
            }
            $item->from_location_id = $location->id;
        } elseif (!empty($data['source_rack'])) {
            $location = Location::where('rack_code', trim($data['source_rack']))
                ->where('is_active', true)
                ->whereHas('warehouse', fn($q) => $q->where('tenant_id', $tenant->id))
                ->first();

            if (!$location) {
                abort(422, "Lokasi rak '{$data['source_rack']}' tidak ditemukan atau tidak aktif.");
            }
            $item->from_location_id = $location->id;
        }

        $item->good_qty = $data['good_qty'];
        $item->damaged_qty = $data['damaged_qty'];
        $item->damage_note = $data['damage_note'] ?? null;
        $item->save();

        if (in_array(strtoupper($item->transaction->status), ['DRAFT', 'PENDING'])) {
            $item->transaction->status = 'PICKING';
            $item->transaction->save();
        }

        return ['success' => true, 'message' => 'Alokasi picking dan lokasi asal rak berhasil diperbarui.'];
    }

    public function commitOutbound(string $tenantSlug, string $manifestCode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $manifestCode) {
            $tx = $this->findOutboundTransaction($tenant->id, $manifestCode, true, ['items.sku', 'items.fromLocation']);

            if (!$tx) {
                abort(404, "Manifest outbound '{$manifestCode}' tidak ditemukan saat commit.");
            }

            // Idempotency guard: cegah pemotongan stok ganda jika client retry akibat timeout
            if (strtoupper($tx->status) === 'COMMITTED') {
                return [
                    'success' => true,
                    'message' => 'Manifest outbound sudah di-commit sebelumnya.',
                ];
            }

            foreach ($tx->items as $item) {
                if ($item->good_qty > 0) {
                    if (!$item->from_location_id) {
                        $skuName = $item->sku->sku_code ?? 'Item';
                        abort(422, "Item {$skuName} belum dialokasikan ke rak asal pengambilan!");
                    }

                    // Lock baris inventory_stocks agar tidak terjadi race condition antar-picker
                    $stock = InventoryStock::where('sku_id', $item->sku_id)
                        ->where('location_id', $item->from_location_id)
                        ->lockForUpdate()
                        ->first();

                    if (!$stock || $stock->quantity < $item->good_qty) {
                        $rackCode = $item->fromLocation->rack_code ?? 'terpilih';
                        $available = $stock?->quantity ?? 0;
                        $skuName = $item->sku->sku_code ?? 'Item';
                        abort(422, "Stok barang {$skuName} di Rak {$rackCode} tidak mencukupi (Tersedia: {$available}, Ingin dipotong: {$item->good_qty})");
                    }

                    $stock->decrement('quantity', $item->good_qty);

                    $sku = Sku::where('id', $item->sku_id)->lockForUpdate()->first();
                    if ($sku && (float) $sku->current_stock >= (float) $item->good_qty) {
                        $sku->decrement('current_stock', $item->good_qty);
                    }
                }
            }

            $tx->status = 'COMMITTED';
            $tx->sync_status = 'SYNCED';
            $tx->save();

            return ['success' => true, 'message' => 'Stok berhasil dipotong dari rak gudang dan transaksi di-commit.'];
        });
    }

    public function holdOutboundSession(string $tenantSlug, string $manifestCode, string $reason = 'Hold by Operator'): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tx = $this->findOutboundTransaction($tenant->id, $manifestCode);

        if (!$tx) {
            abort(404, "Manifest outbound '{$manifestCode}' tidak ditemukan.");
        }

        $tx->status = 'ON_HOLD';
        if (!empty(trim($reason))) {
            $tx->notes = trim(($tx->notes ? $tx->notes . ' | ' : '') . "[HOLD: {$reason}]");
        }
        $tx->save();

        return ['success' => true, 'message' => 'Sesi outbound di-hold.'];
    }

    public function resumeOutboundSession(string $tenantSlug, string $manifestCode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tx = $this->findOutboundTransaction($tenant->id, $manifestCode);

        if (!$tx) {
            abort(404, "Manifest outbound '{$manifestCode}' tidak ditemukan.");
        }

        $tx->status = 'PICKING';
        $tx->save();

        return ['success' => true, 'message' => 'Sesi outbound dilanjutkan.'];
    }

    public function syncOfflineManifest(string $tenantSlug, array $payload, int $userId): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $incomingCode = trim($payload['manifest_code'] ?? $payload['local_uuid'] ?? '');

        if ($incomingCode === '') {
            abort(422, 'manifest_code atau local_uuid wajib diisi saat sinkronisasi.');
        }

        $shouldCommit = (bool) ($payload['should_commit'] ?? false);

        return DB::transaction(function () use ($tenantSlug, $tenant, $payload, $incomingCode, $shouldCommit) {
            $tx = $this->findOutboundTransaction($tenant->id, $incomingCode, true);

            if (!$tx) {
                abort(404, "Manifest outbound '{$incomingCode}' tidak ditemukan.");
            }

            if (strtoupper($tx->status) === 'COMMITTED') {
                return [
                    'manifest_code'  => $tx->local_uuid,
                    'status'         => 'COMMITTED',
                    'already_synced' => true,
                    'message'        => 'Data offline outbound sudah ter-commit sebelumnya.',
                ];
            }

            $tx->status = 'PICKING';
            $tx->sync_status = 'SYNCED';
            $tx->save();

            $rackMap = Location::whereHas('warehouse', fn($q) => $q->where('tenant_id', $tenant->id))
                ->where('is_active', true)
                ->pluck('id', 'rack_code');

            foreach ($payload['items'] as $index => $itemData) {
                $skuId = (int) $itemData['sku_id'];
                $skuBelongsToTenant = DB::table('skus')
                    ->join('products', 'skus.product_id', '=', 'products.id')
                    ->where('skus.id', $skuId)
                    ->where('products.tenant_id', $tenant->id)
                    ->exists();
                if (!$skuBelongsToTenant) {
                    throw ValidationException::withMessages([
                        "items.{$index}.sku_id" => 'SKU tidak terdaftar pada tenant ini.',
                    ]);
                }

                $goodQty = (int) ($itemData['good_qty'] ?? 0);
                $damagedQty = (int) ($itemData['damaged_qty'] ?? 0);
                $fromLocationId = $itemData['source_rack_id'] ?? null;
                if (!$fromLocationId && !empty($itemData['source_rack'])) {
                    $fromLocationId = $rackMap[trim((string) $itemData['source_rack'])] ?? null;
                }

                $existingItem = TransactionItem::where('transaction_id', $tx->id)
                    ->where('sku_id', $skuId)
                    ->lockForUpdate()
                    ->first();

                if (!$existingItem) {
                    throw ValidationException::withMessages([
                        "items.{$index}.sku_id" => 'SKU tidak termasuk dalam manifest outbound ini.',
                    ]);
                }

                $existingItem->from_location_id = $fromLocationId ?? $existingItem->from_location_id;
                $existingItem->good_qty = $goodQty;
                $existingItem->damaged_qty = $damagedQty;
                $existingItem->damage_note = $itemData['damage_note'] ?? $existingItem->damage_note;
                $existingItem->save();
            }

            if ($shouldCommit) {
                $this->commitOutbound($tenantSlug, $tx->local_uuid);
            }

            return [
                'manifest_code'  => $tx->local_uuid,
                'status'         => $shouldCommit ? 'COMMITTED' : 'PICKING',
                'already_synced' => false,
                'message'        => 'Sinkronisasi transaksi outbound offline berhasil.',
            ];
        });
    }
}
