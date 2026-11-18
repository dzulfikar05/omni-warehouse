<?php

namespace App\Http\Controllers\Api;

use App\Contracts\StockOpnameContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockOpnameController extends Controller
{
    public function __construct(
        protected StockOpnameContract $service
    ) {}

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
