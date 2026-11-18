<?php

namespace App\Http\Controllers\Api;

use App\Contracts\StockOpnameContract;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockOpnameController extends Controller
{
    public function __construct(
        protected StockOpnameContract $service
    ) {}

    /**
     * List stock opname sessions for the mobile session picker.
     */
    public function index(Request $request, string $tenant_slug): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $itemSummary = DB::table('transaction_items')
            ->select('transaction_id')
            ->selectRaw('COUNT(*) as total_items')
            ->selectRaw('SUM(CASE WHEN counted_at IS NOT NULL THEN 1 ELSE 0 END) as counted_items')
            ->groupBy('transaction_id');
        $warehouseSummary = DB::table('transaction_items')
            ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->select('transaction_items.transaction_id')
            ->selectRaw('MIN(warehouses.name) as fallback_warehouse_name')
            ->selectRaw('MIN(warehouses.code) as fallback_warehouse_code')
            ->groupBy('transaction_items.transaction_id');
        $locationSummary = DB::table('transaction_items')
            ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->select('transaction_items.transaction_id')
            ->selectRaw('COUNT(DISTINCT locations.id) as item_location_count')
            ->selectRaw('MIN(locations.rack_code) as fallback_rack_code')
            ->selectRaw('MIN(locations.zone) as fallback_location_zone')
            ->groupBy('transaction_items.transaction_id');

        $sessions = DB::table('transactions')
            ->leftJoin('users', 'transactions.created_by', '=', 'users.id')
            ->leftJoin('warehouses', 'transactions.warehouse_id', '=', 'warehouses.id')
            ->leftJoin('locations as opname_location', 'transactions.location_id', '=', 'opname_location.id')
            ->leftJoinSub($itemSummary, 'item_summary', function ($join) {
                $join->on('transactions.id', '=', 'item_summary.transaction_id');
            })
            ->leftJoinSub($warehouseSummary, 'warehouse_summary', function ($join) {
                $join->on('transactions.id', '=', 'warehouse_summary.transaction_id');
            })
            ->leftJoinSub($locationSummary, 'location_summary', function ($join) {
                $join->on('transactions.id', '=', 'location_summary.transaction_id');
            })
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', 'STOCK_OPNAME')
            ->select(
                'transactions.id',
                'transactions.local_uuid as session_code',
                'transactions.status',
                'transactions.warehouse_id',
                'transactions.location_id',
                'transactions.dock_bay',
                'transactions.created_at',
                'users.name as auditor_name',
                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
                'warehouse_summary.fallback_warehouse_name',
                'warehouse_summary.fallback_warehouse_code',
                'opname_location.rack_code as location_rack',
                'opname_location.zone as location_zone',
                'location_summary.item_location_count',
                'location_summary.fallback_rack_code',
                'location_summary.fallback_location_zone',
                'item_summary.total_items',
                'item_summary.counted_items'
            )
            ->latest('transactions.created_at')
            ->paginate($validated['per_page'] ?? 15);

        $sessions->getCollection()->transform(function ($session) {
            $session->status = strtoupper($session->status);
            $session->warehouse_name = $session->warehouse_name ?? $session->fallback_warehouse_name ?? '-';
            $session->warehouse_code = $session->warehouse_code ?? $session->fallback_warehouse_code ?? '-';
            $session->location_label = $session->location_rack
                ? $session->location_rack.($session->location_zone ? ' · '.$session->location_zone : '')
                : ((int) $session->item_location_count === 1
                    ? $session->fallback_rack_code.($session->fallback_location_zone ? ' · '.$session->fallback_location_zone : '')
                    : (in_array(strtolower(trim((string) $session->dock_bay)), ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true)
                        ? 'Semua lokasi'
                        : 'Zona '.$session->dock_bay));
            $session->total_items = (int) ($session->total_items ?? 0);
            $session->counted_items = (int) ($session->counted_items ?? 0);

            unset(
                $session->dock_bay,
                $session->fallback_warehouse_name,
                $session->fallback_warehouse_code,
                $session->location_rack,
                $session->location_zone,
                $session->item_location_count,
                $session->fallback_rack_code,
                $session->fallback_location_zone
            );

            return $session;
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar sesi stock opname berhasil dimuat.',
            'data' => $sessions,
        ]);
    }

    /**
     * Load a specific stock opname session for resume or read-only detail.
     */
    public function show(string $tenant_slug, int $session_id): JsonResponse
    {
        $data = $this->service->getActiveSessionData($tenant_slug, true, $session_id);

        if (! $data['session']) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi stock opname tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail sesi stock opname berhasil dimuat.',
            'data' => $data,
        ]);
    }

    /**
     * Get active stock opname session for mobile scanner (Blind Counting Mode).
     */
    public function activeSession(Request $request, string $tenant_slug): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'integer'],
        ]);
        $data = $this->service->getActiveSessionData(
            $tenant_slug,
            true,
            $validated['session_id'] ?? null
        );

        if (isset($validated['session_id'])
            && (! $data['session'] || ! in_array($data['session']['status'], ['DRAFT', 'COUNTING', 'REVIEW'], true))) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi stock opname aktif tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => $data['session']
                ? 'Sesi stock opname aktif berhasil dimuat.'
                : 'Tidak ada sesi stock opname aktif saat ini.',
            'data' => $data,
        ]);
    }

    /**
     * Synchronize offline-counted stock opname items from mobile SQLite (Idempotent & FIFO).
     */
    public function syncOffline(Request $request, string $tenant_slug): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'integer'],
            'session_code' => ['nullable', 'string', 'max:100'],
            'local_uuid' => ['nullable', 'string', 'max:100'],
            'transaction_uuid' => ['nullable', 'string', 'max:100'],
            'should_submit_review' => ['nullable', 'boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['nullable', 'integer'],
            'items.*.sku_id' => ['nullable', 'integer'],
            'items.*.barcode' => ['nullable', 'string', 'max:100'],
            'items.*.location_id' => ['nullable', 'integer'],
            'items.*.target_rack' => ['nullable', 'string', 'max:100'],
            'items.*.physical_qty' => ['required', 'integer', 'min:0'],
        ]);

        $res = $this->service->syncOfflineOpname(
            $tenant_slug,
            $validated,
            (int) $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => $res['message'],
            'data' => $res,
        ]);
    }

    /**
     * Record physical count via manual input (item_id) or barcode scan (session_id/session_code + barcode).
     */
    public function recordCount(Request $request, string $tenant_slug): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => ['nullable', 'integer'],
            'session_id' => ['nullable', 'integer'],
            'session_code' => ['nullable', 'string', 'max:100'],
            'barcode' => ['nullable', 'string', 'max:100'],
            'location_id' => ['nullable', 'integer'],
            'target_rack' => ['nullable', 'string', 'max:100'],
            'physical_qty' => ['nullable', 'integer', 'min:0'],
            'is_increment' => ['nullable', 'boolean'],
        ]);

        $res = $this->service->updateItemPhysicalQty($tenant_slug, $validated, (int) $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => $res['message'],
            'data' => [
                'physical_qty' => $res['physical_qty'],
            ],
        ]);
    }

    /**
     * Submit completed counting session from mobile to supervisor review.
     */
    public function submitReview(Request $request, string $tenant_slug): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'integer'],
            'session_code' => ['nullable', 'string', 'max:100'],
        ]);

        $identifier = $validated['session_id'] ?? $validated['session_code'] ?? null;

        if (! $identifier) {
            return response()->json([
                'success' => false,
                'message' => 'session_id atau session_code wajib diisi.',
            ], 422);
        }

        $submitted = $this->service->submitSessionForReview($tenant_slug, $identifier);

        return response()->json([
            'success' => $submitted,
            'message' => $submitted
                ? 'Hasil penghitungan opname berhasil dikirim untuk proses review.'
                : 'Gagal mengirim sesi opname. Pastikan status sesi masih COUNTING.',
        ], $submitted ? 200 : 422);
    }
}
