<?php

namespace App\Services;

use App\Contracts\OutboundContract;
use App\Models\Customer;
use App\Models\InventoryStock;
use App\Models\Sku;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OutboundService implements OutboundContract
{
    public function getOutboundManifestsList(string $tenantSlug, array $filters = []): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $query = Transaction::where('tenant_id', $tenant->id)
            ->where('transaction_type', 'OUTBOUND')
            ->with(['customer:id,name', 'items.sku']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('local_uuid', 'LIKE', "\%{$search}%")
                    ->orWhereHas('customer', fn($c) => $c->where('name', 'LIKE', "\%{$search}%"));
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
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
                'status'        => $tx->status,
                'customer_name' => $tx->customer->name ?? '-',
                'created_by'    => (string) $tx->created_by,
                'created_at'    => $tx->created_at->toIso8601String(),
                'total_skus'    => $totalSkus,
                'total_units'   => $totalUnits,
            ];
        });

        $summary = [
            'total'       => Transaction::where('tenant_id', $tenant->id)->where('transaction_type', 'OUTBOUND')->count(),
            'pending'     => Transaction::where('tenant_id', $tenant->id)->where('transaction_type', 'OUTBOUND')->whereIn('status', ['DRAFT', 'PICKING', 'HOLD'])->count(),
            'completed'   => Transaction::where('tenant_id', $tenant->id)->where('transaction_type', 'OUTBOUND')->whereIn('status', ['COMMITTED', 'CLOSED'])->count(),
            'total_units' => TransactionItem::whereHas('transaction', fn($q) => $q->where('tenant_id', $tenant->id)->where('transaction_type', 'OUTBOUND'))->sum('quantity'),
        ];

        return [
            'manifests' => $manifests,
            'summary'   => $summary,
            'statuses'  => ['DRAFT', 'PICKING', 'HOLD', 'COMMITTED', 'CLOSED'],
        ];
    }

    public function createManifest(string $tenantSlug, array $data, int $userId): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $data, $userId) {
            $manifestCode = 'OUT-' . strtoupper(Str::random(8));

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
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'sku_id'         => $item['sku_id'],
                    'quantity'       => $item['so_qty'],
                    'good_qty'       => 0,
                    'damaged_qty'    => 0,
                    'created_by'     => $userId,
                ]);
            }

            return ['manifest_code' => $manifestCode];
        });
    }

    public function getManifestDetail(string $tenantSlug, string $manifestCode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        $tx = Transaction::where('tenant_id', $tenant->id)
            ->where('transaction_type', 'OUTBOUND')
            ->where('local_uuid', $manifestCode)
            ->with([
                'customer',
                'items.sku.product',
                'items.sku.unitModel',
                'items.fromLocation'
            ])
            ->firstOrFail();

        $totalSkus = $tx->items->pluck('sku_id')->unique()->count();
        $totalPoUnits = (int) $tx->items->sum('quantity');
        $goodUnits = (int) $tx->items->sum('good_qty');
        $damagedUnits = (int) $tx->items->sum('damaged_qty');
        $pct = $totalPoUnits > 0 ? round((($goodUnits + $damagedUnits) / $totalPoUnits) * 100, 1) : 0;

        $manifest = [
            'manifest_code'  => $tx->local_uuid,
            'status'         => $tx->status,
            'customer_name'  => $tx->customer->name ?? '-',
            'vehicle_no'     => $tx->vehicle_no ?? '-',
            'driver_name'   => $tx->driver_name ?? '-',
            'total_skus'     => $totalSkus,
            'total_po_units' => $totalPoUnits,
            'good_units'     => $goodUnits,
            'damaged_units'  => $damagedUnits,
            'progress_pct'   => $pct,
        ];

        $items = $tx->items->map(function ($ti) {
            $status = 'pending';
            $statusLabel = 'Pending Picking';

            if (($ti->good_qty + $ti->damaged_qty) >= $ti->quantity) {
                $status = $ti->damaged_qty > 0 ? 'issue' : 'valid';
                $statusLabel = $ti->damaged_qty > 0 ? 'Ada Cacat/Selisih' : 'Selesai Pick';
            } elseif ($ti->good_qty > 0 || $ti->damaged_qty > 0) {
                $status = 'process';
                $statusLabel = 'Dalam Process Pick';
            }

            return [
                'id'           => $ti->id,
                'sku_id'       => $ti->sku_id,
                'sku'          => $ti->sku->sku_code ?? '-',
                'barcode'      => $ti->sku->barcode ?? '-',
                'product_name' => $ti->sku->product->name ?? '-',
                'category'     => '-',
                'batch_no'     => $ti->batch_number ?? '-',
                'exp_date'     => $ti->expiry_date ? $ti->expiry_date->format('Y-m-d') : '-',
                'po_qty'       => $ti->quantity,
                'good_qty'     => $ti->good_qty,
                'damaged_qty'  => $ti->damaged_qty,
                'unit'         => $ti->sku->unitModel->symbol ?? 'PCS',
                'target_rack'  => $ti->fromLocation->rack_code ?? 'Belum Dialokasi',
                'damage_note'  => $ti->damage_note,
                'status'       => $status,
                'status_label' => $statusLabel,
            ];
        });

        return [
            'manifest' => $manifest,
            'items'    => $items,
        ];
    }

    public function verifyBarcode(string $tenantSlug, string $manifestCode, string $barcode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tx = Transaction::where('tenant_id', $tenant->id)
            ->where('transaction_type', 'OUTBOUND')
            ->where('local_uuid', $manifestCode)
            ->firstOrFail();

        $sku = Sku::where('barcode', $barcode)
            ->whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->first();

        if (!$sku) {
            return ['success' => false, 'message' => 'Barcode SKU tidak ditemukan pada database tenant!'];
        }

        $item = TransactionItem::where('transaction_id', $tx->id)
            ->where('sku_id', $sku->id)
            ->first();

        if (!$item) {
            return ['success' => false, 'message' => 'SKU ini tidak terdaftar pada Manifest Outbound ini!'];
        }

        if (($item->good_qty + $item->damaged_qty) >= $item->quantity) {
            return ['success' => false, 'message' => 'Kuantitas pesanan SKU ini sudah terpenuhi!'];
        }

        $item->increment('good_qty');

        return ['success' => true, 'message' => "Scan Berhasil: {$sku->sku_code} kuantitas picking bertambah 1."];
    }

    public function updatePickingAllocation(string $tenantSlug, array $data): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $item = TransactionItem::findOrFail($data['item_id']);

        if (!empty($data['source_rack_id'])) {
            $item->from_location_id = $data['source_rack_id'];
        }

        $item->good_qty = $data['good_qty'];
        $item->damaged_qty = $data['damaged_qty'];
        $item->damage_note = $data['damage_note'] ?? null;
        $item->save();

        return ['success' => true, 'message' => 'Alokasi picking dan lokasi asal rak berhasil diperbarui.'];
    }

    public function commitOutbound(string $tenantSlug, string $manifestCode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();

        return DB::transaction(function () use ($tenant, $manifestCode) {
            $tx = Transaction::where('tenant_id', $tenant->id)
                ->where('transaction_type', 'OUTBOUND')
                ->where('local_uuid', $manifestCode)
                ->firstOrFail();

            foreach ($tx->items as $item) {
                if ($item->from_location_id && $item->good_qty > 0) {
                    $stock = InventoryStock::where('sku_id', $item->sku_id)
                        ->where('location_id', $item->from_location_id)
                        ->first();

                    if ($stock) {
                        $stock->decrement('quantity', $item->good_qty);
                    }

                    // Potong master total stock SKU
                    $sku = Sku::find($item->sku_id);
                    if ($sku) {
                        $sku->decrement('current_stock', $item->good_qty);
                    }
                }
            }

            $tx->status = 'COMMITTED';
            $tx->save();

            return ['success' => true, 'message' => 'Stok berhasil dipotong dari rak gudang dan transaksi di-commit.'];
        });
    }

    public function holdOutboundSession(string $tenantSlug, string $manifestCode, string $reason = 'Hold by Operator'): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tx = Transaction::where('tenant_id', $tenant->id)
            ->where('transaction_type', 'OUTBOUND')
            ->where('local_uuid', $manifestCode)
            ->firstOrFail();

        $tx->status = 'HOLD';
        $tx->notes = trim($tx->notes . " [HOLD REASON: {$reason}]");
        $tx->save();

        return ['success' => true, 'message' => 'Sesi outbound di-hold.'];
    }

    public function resumeOutboundSession(string $tenantSlug, string $manifestCode): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $tx = Transaction::where('tenant_id', $tenant->id)
            ->where('transaction_type', 'OUTBOUND')
            ->where('local_uuid', $manifestCode)
            ->firstOrFail();

        $tx->status = 'PICKING';
        $tx->save();

        return ['success' => true, 'message' => 'Sesi outbound dilanjutkan.'];
    }
}
