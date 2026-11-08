<?php

namespace App\Services;

use App\Contracts\InboundContract;
use App\Models\InventoryStock;
use App\Models\Sku;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InboundService implements InboundContract
{
    public function getInboundManifestsList(string $tenant_slug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();
        if (!$tenant) {
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
            ->map(fn($status) => strtoupper($status))
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
            $query->where(function ($searchQuery) use ($search, $tenant) {
                $searchQuery
                    ->where('transactions.local_uuid', 'like', "%{$search}%")
                    ->orWhereExists(function ($itemQuery) use ($search, $tenant) {
                        $itemQuery->selectRaw('1')
                            ->from('transaction_items')
                            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
                            ->join('products', 'skus.product_id', '=', 'products.id')
                            ->whereColumn('transaction_items.transaction_id', 'transactions.id')
                            ->where('products.tenant_id', $tenant->id)
                            ->where(function ($sq) use ($search) {
                                $sq->where('skus.sku_code', 'like', "%{$search}%")
                                    ->orWhere('skus.barcode', 'like', "%{$search}%");
                            });
                    });
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('transactions.created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('transactions.created_at', '<=', $filters['date_to']);
        }
        if (!empty($filters['status'])) {
            $query->whereRaw('UPPER(transactions.status) = ?', [strtoupper($filters['status'])]);
        }
        if (!empty($filters['supplier_id'])) {
            $query->where('transactions.supplier_id', $filters['supplier_id']);
        }

        return [
            'manifests' => $query
                ->orderByDesc('transactions.created_at')
                ->paginate(10)
                ->withQueryString()
                ->through(fn($manifest) => [
                    'manifest_code' => $manifest->manifest_code,
                    'po_number' => $manifest->manifest_code,
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

    public function createManifest(string $tenant_slug, array $data, int $userId): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $data, $userId) {
            $manifestCode = 'TX-PO-' . strtoupper(Str::random(8));

            $transactionId = DB::table('transactions')->insertGetId([
                'tenant_id' => $tenant->id,
                'user_id' => $userId,
                'supplier_id' => $data['supplier_id'] ?? null,
                'local_uuid' => $manifestCode,
                'status' => 'DRAFT',
                'sync_status' => 'SYNCED',
                'transaction_type' => 'INBOUND',
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (!empty($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $skuId = $item['sku_id'] ?? $item['product_id'] ?? null;
                    $quantity = $item['po_qty'] ?? $item['expected_qty'] ?? 1;

                    if (!$skuId) continue;

                    DB::table('transaction_items')->insert([
                        'transaction_id' => $transactionId,
                        'sku_id' => $skuId,
                        'quantity' => $quantity,
                        'good_qty' => 0,
                        'damaged_qty' => 0,
                        'created_by' => $userId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            return ['manifest_code' => $manifestCode];
        });
    }

    public function createManifestFromPo(string $tenant_slug, array $data, int $userId): array
    {
        return $this->createManifest($tenant_slug, $data, $userId);
    }

    public function getManifestDetail(string $tenant_slug, string $manifest_code): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $transaction = DB::table('transactions')
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.local_uuid', $manifest_code)
            ->leftJoin('suppliers', 'transactions.supplier_id', '=', 'suppliers.id')
            ->leftJoin('users', 'transactions.user_id', '=', 'users.id')
            ->select(
                'transactions.*',
                'suppliers.name as supplier_name',
                'users.name as operator_name'
            )
            ->first();

        if (!$transaction) {
            abort(404, 'Manifest inbound tidak ditemukan.');
        }

        $rawItems = DB::table('transaction_items')
            ->where('transaction_items.transaction_id', $transaction->id)
            ->join('skus', 'transaction_items.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->leftJoin('units', 'skus.unit_id', '=', 'units.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->leftJoin('locations', 'transaction_items.to_location_id', '=', 'locations.id')
            ->select(
                'transaction_items.*',
                'skus.sku_code as sku',
                'skus.barcode',
                'products.name as product_name',
                'categories.name as category',
                'units.symbol as unit',
                'locations.rack_code as target_rack'
            )
            ->get();

        $items = $rawItems->map(function ($item) {
            $poQty = (int) $item->quantity;
            $goodQty = (int) ($item->good_qty ?? 0);
            $damagedQty = (int) ($item->damaged_qty ?? 0);
            $scanned = $goodQty + $damagedQty;

            $status = 'pending';
            $statusLabel = 'Menunggu Scan';

            if ($damagedQty > 0) {
                $status = 'issue';
                $statusLabel = 'Ada Selisih / BAP';
            } else if ($goodQty >= $poQty && $poQty > 0) {
                $status = 'valid';
                $statusLabel = 'Sesuai / Valid';
            } else if ($scanned > 0) {
                $status = 'process';
                $statusLabel = 'Proses Scan';
            }

            return [
                'id' => (int) $item->id,
                'sku_id' => (int) $item->sku_id,
                'sku' => $item->sku,
                'barcode' => $item->barcode ?? $item->sku,
                'product_name' => $item->product_name,
                'category' => $item->category ?? 'General',
                'po_qty' => $poQty,
                'expected_qty' => $poQty,
                'good_qty' => $goodQty,
                'damaged_qty' => $damagedQty,
                'unit' => $item->unit ?? 'Pcs',
                'target_rack' => $item->target_rack ?? 'Belum Dialokasi',
                'damage_note' => $item->damage_note ?? '',
                'status' => $status,
                'status_label' => $statusLabel,
            ];
        })->toArray();

        $totalPo = array_sum(array_column($items, 'po_qty'));
        $totalGood = array_sum(array_column($items, 'good_qty'));
        $totalDamaged = array_sum(array_column($items, 'damaged_qty'));

        return [
            'manifest' => [
                'manifest_code' => $transaction->local_uuid,
                'po_number' => $transaction->local_uuid,
                'status' => strtoupper($transaction->status),
                'supplier_name' => $transaction->supplier_name ?? '-',
                'warehouse_name' => $tenant->name,
                'operator_name' => $transaction->operator_name ?? 'Operator',
                'total_skus' => count($items),
                'total_po_units' => $totalPo,
                'good_units' => $totalGood,
                'damaged_units' => $totalDamaged,
                'progress_percentage' => $totalPo > 0 ? round((($totalGood + $totalDamaged) / $totalPo) * 100, 1) : 0,
            ],
            'items' => $items,
        ];
    }

    public function verifyBarcode(string $tenant_slug, string $manifest_code, string $barcode): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $cleanBarcode = trim($barcode);

        return DB::transaction(function () use ($tenant, $manifest_code, $cleanBarcode) {
            $transaction = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('local_uuid', $manifest_code)
                ->lockForUpdate()
                ->first();

            if (!$transaction) {
                return ['success' => false, 'message' => 'Manifest tidak ditemukan.'];
            }

            $currentStatus = strtoupper($transaction->status);
            if (in_array($currentStatus, ['COMMITTED', 'CLOSED', 'CANCELLED'])) {
                return ['success' => false, 'message' => "Inbound dikunci dengan status '{$currentStatus}'."];
            }

            $sku = DB::table('skus')
                ->join('products', 'skus.product_id', '=', 'products.id')
                ->where('products.tenant_id', $tenant->id)
                ->where(function ($q) use ($cleanBarcode) {
                    $q->where('skus.barcode', $cleanBarcode)
                        ->orWhere('skus.sku_code', $cleanBarcode);
                })
                ->select('skus.id', 'skus.sku_code')
                ->first();

            if (!$sku) {
                return ['success' => false, 'message' => "Barcode/SKU '{$cleanBarcode}' tidak terdaftar!"];
            }

            $item = DB::table('transaction_items')
                ->where('transaction_id', $transaction->id)
                ->where('sku_id', $sku->id)
                ->lockForUpdate()
                ->first();

            if (!$item) {
                return ['success' => false, 'message' => "SKU '{$sku->sku_code}' tidak terdaftar dalam manifest ini!"];
            }

            $goodQtyCurrent = (int) ($item->good_qty ?? 0);
            $poQuantity = (int) $item->quantity;

            if ($goodQtyCurrent >= $poQuantity) {
                return [
                    'success' => false,
                    'message' => "Item '{$sku->sku_code}' sudah tervalidasi lengkap ({$goodQtyCurrent}/{$poQuantity} unit).",
                ];
            }

            DB::table('transaction_items')
                ->where('id', $item->id)
                ->update([
                    'good_qty' => $goodQtyCurrent + 1,
                    'updated_at' => now(),
                ]);

            if (in_array($currentStatus, ['DRAFT', 'PENDING'])) {
                DB::table('transactions')
                    ->where('id', $transaction->id)
                    ->update(['status' => 'RECEIVING', 'updated_at' => now()]);
            }

            return [
                'success' => true,
                'message' => "Berhasil scan SKU '{$sku->sku_code}' (+1 Unit).",
            ];
        });
    }

    public function updatePutawayAllocation(string $tenant_slug, array $data): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $location = DB::table('locations')
            ->where('tenant_id', $tenant->id)
            ->where('rack_code', $data['target_rack'])
            ->first();

        DB::table('transaction_items')
            ->where('id', $data['item_id'])
            ->update([
                'to_location_id' => $location?->id,
                'good_qty' => $data['good_qty'] ?? 0,
                'damaged_qty' => $data['damaged_qty'] ?? 0,
                'damage_note' => $data['damage_note'] ?? null,
                'updated_at' => now(),
            ]);

        return ['success' => true, 'message' => 'Alokasi rak dan fisik berhasil diperbarui.'];
    }

    public function commitInbound(string $tenant_slug, string $manifest_code): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $manifest_code) {
            $transaction = DB::table('transactions')
                ->where('tenant_id', $tenant->id)
                ->where('local_uuid', $manifest_code)
                ->lockForUpdate()
                ->firstOrFail();

            $items = DB::table('transaction_items')
                ->where('transaction_id', $transaction->id)
                ->get();

            foreach ($items as $item) {
                $goodQty = (int) ($item->good_qty ?? 0);
                if ($goodQty > 0 && $item->to_location_id) {
                    $stock = InventoryStock::firstOrNew([
                        'sku_id' => $item->sku_id,
                        'location_id' => $item->to_location_id,
                        'batch_number' => $item->batch_number ?? 'DEFAULT',
                    ]);

                    $stock->quantity = ($stock->quantity ?? 0) + $goodQty;
                    $stock->created_by = $transaction->user_id;
                    $stock->save();

                    Sku::where('id', $item->sku_id)->increment('current_stock', $goodQty);
                }
            }

            DB::table('transactions')
                ->where('id', $transaction->id)
                ->update(['status' => 'COMMITTED', 'updated_at' => now()]);

            return true;
        });
    }

    public function holdInbound(string $tenant_slug, string $manifest_code, ?string $reason = 'Hold by Operator'): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return DB::table('transactions')
            ->where('tenant_id', $tenant->id)
            ->where('local_uuid', $manifest_code)
            ->update([
                'status' => 'ON_HOLD',
                'updated_at' => now(),
            ]) > 0;
    }

    public function resumeInbound(string $tenant_slug, string $manifest_code): bool
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        return DB::table('transactions')
            ->where('tenant_id', $tenant->id)
            ->where('local_uuid', $manifest_code)
            ->update([
                'status' => 'RECEIVING',
                'updated_at' => now(),
            ]) > 0;
    }



    public function holdInboundSession(string $tenant_slug, string $manifest_code, ?string $reason = 'Penundaan Operator'): bool
    {
        return $this->holdInbound($tenant_slug, $manifest_code, $reason);
    }

    public function resumeInboundSession(string $tenant_slug, string $manifest_code): bool
    {
        return $this->resumeInbound($tenant_slug, $manifest_code);
    }
}
