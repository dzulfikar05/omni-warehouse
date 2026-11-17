<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sku;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected ?DashboardService $dashboardService;

    public function __construct(?DashboardService $dashboardService = null)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Mengambil ringkasan KPI dan antrean tugas lapangan untuk aplikasi Mobile Handheld WMS.
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // 1. KPI Counts
        $activeInboundCount = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['IN', 'INBOUND'])
            ->whereIn('status', ['pending', 'receiving', 'draft', 'in_progress'])
            ->count();

        $activeOutboundCount = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['OUT', 'OUTBOUND'])
            ->whereIn('status', ['pending', 'picking', 'packing', 'draft', 'in_progress'])
            ->count();

        $pendingTransferCount = Transaction::where('tenant_id', $tenantId)
            ->whereIn('transaction_type', ['TRANSFER', 'transfer'])
            ->whereIn('status', ['pending', 'draft', 'in_progress'])
            ->count();

        // Jika data operasional masih seimbang/completed di database demo, hitung juga total aktif & pending
        $activeOpnameCount = 0;

        // 2. Tentukan Shift Berdasarkan Jam Server
        $hour = (int) now()->format('H');
        if ($hour >= 6 && $hour < 14) {
            $shiftName = 'Shift 1 (Pagi) • 06:00 - 14:00';
        } elseif ($hour >= 14 && $hour < 22) {
            $shiftName = 'Shift 2 (Sore) • 14:00 - 22:00';
        } else {
            $shiftName = 'Shift 3 (Malam) • 22:00 - 06:00';
        }

        // 3. Ambil Daftar Transaksi / Tugas Lapangan (HANYA Antrean Aktif / Belum Selesai)
        $transactions = Transaction::with(['supplier:id,name', 'customer:id,name', 'items.sku.product'])
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['pending', 'receiving', 'picking', 'packing', 'draft', 'in_progress'])
            ->latest()
            ->take(8)
            ->get();

        $tasks = $transactions->map(function ($tx) {
            $rawType = strtoupper($tx->transaction_type);
            $type = match ($rawType) {
                'IN', 'INBOUND' => 'inbound',
                'OUT', 'OUTBOUND' => 'outbound',
                'TRANSFER' => 'transfer',
                default => 'opname',
            };

            $status = strtolower($tx->status ?? 'pending');
            $badgeLabel = match ($status) {
                'receiving'   => 'RECEIVING',
                'picking'     => 'PICKING',
                'packing'     => 'PACKING',
                'draft'       => 'DRAFT',
                'in_progress' => 'PROSES',
                'completed'   => ($type === 'outbound' ? 'TERKIRIM' : 'SELESAI'),
                default       => ($type === 'inbound' ? 'PO INBOUND' : ($type === 'outbound' ? 'SO OUTBOUND' : 'MUTASI RAK')),
            };

            $title = match ($type) {
                'inbound'  => $tx->supplier?->name ?? 'Penerimaan Barang Masuk',
                'outbound' => $tx->customer?->name ?? 'Pengiriman Barang Keluar',
                'transfer' => 'Mutasi Antar Rak / Gudang',
                default    => 'Pemeriksaan Stok Opname',
            };

            $totalQty = (int) $tx->items->sum('quantity');
            if ($totalQty <= 0) {
                $totalQty = 1;
            }

            $completedQty = (int) $tx->items->sum('good_qty');
            if ($completedQty <= 0 && $status === 'completed') {
                $completedQty = $totalQty;
            }

            $skuCount = $tx->items->count();
            $dockInfo = $tx->dock_bay ? "Dock Bay {$tx->dock_bay}" : 'Gudang Utama';

            $subtitle = match ($type) {
                'inbound'  => "{$skuCount} SKU • {$dockInfo}" . ($tx->driver_name ? " • {$tx->driver_name}" : ''),
                'outbound' => "{$skuCount} SKU • {$totalQty} Unit Dispatched",
                'transfer' => "{$skuCount} SKU • Mutasi Internal",
                default    => "{$skuCount} SKU Terjadwal",
            };

            // Format kode referensi ramah manusia jika nilai di database berupa raw UUID
            $code = $tx->local_uuid ?? "TX-{$tx->id}";
            if (str_contains($code, '-') && strlen($code) >= 32) {
                $prefix = match ($type) {
                    'inbound'  => 'PO',
                    'outbound' => 'SO',
                    'transfer' => 'TRF',
                    default    => 'TX',
                };
                $code = "{$prefix}-" . strtoupper(substr(str_replace('-', '', $tx->local_uuid), 0, 8));
            }

            $route = match ($type) {
                'inbound'  => "/inbound/{$tx->local_uuid}",
                'outbound' => "/outbound/{$tx->local_uuid}",
                'transfer' => "/more/transfer",
                default    => "/dashboard",
            };

            return [
                'id'               => (string) $tx->id,
                'type'             => $type,
                'status'           => $status,
                'badge_label'      => $badgeLabel,
                'code'             => $code,
                'title'            => $title,
                'subtitle'         => $subtitle,
                'progress_current' => $completedQty,
                'progress_total'   => $totalQty,
                'location'         => $dockInfo,
                'route'            => $route,
            ];
        });

        // 4. Tambahan metrik ringkasan gudang
        $totalSkus = Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenantId))->count();
        $totalProducts = Product::where('tenant_id', $tenantId)->count();

        return response()->json([
            'status'  => 'success',
            'message' => 'Ringkasan KPI dan tugas berhasil dimuat.',
            'data'    => [
                'kpi' => [
                    'active_inbound_count'   => $activeInboundCount,
                    'active_outbound_count'  => $activeOutboundCount,
                    'pending_transfer_count' => $pendingTransferCount,
                    'active_opname_count'    => $activeOpnameCount,
                    'offline_queue_count'    => 0,
                ],
                'tasks'              => $tasks->values(),
                'is_online'          => true,
                'shift_name'         => $shiftName,
                'pending_sync_count' => 0,
                'stats' => [
                    'total_skus'     => $totalSkus,
                    'total_products' => $totalProducts,
                ],
            ],
        ], 200);
    }
}

