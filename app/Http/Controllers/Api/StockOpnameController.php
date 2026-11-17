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
    public function activeSession(string $tenant_slug): JsonResponse
    {
        $data = $this->service->getActiveSessionData($tenant_slug, true);

        return response()->json([
            'success' => true,
            'message' => $data['session']
                ? 'Sesi stock opname aktif berhasil dimuat.'
                : 'Tidak ada sesi stock opname aktif saat ini.',
            'data'    => $data,
        ]);
    }

    /**
     * Record physical count via manual input (item_id) or barcode scan (session_id + barcode).
     */
    public function recordCount(Request $request, string $tenant_slug): JsonResponse
    {
        $validated = $request->validate([
            'item_id'      => ['nullable', 'integer'],
            'session_id'   => ['nullable', 'integer'],
            'barcode'      => ['nullable', 'string', 'max:100'],
            'location_id'  => ['nullable', 'integer'],
            'physical_qty' => ['nullable', 'integer', 'min:0'],
            'is_increment' => ['nullable', 'boolean'],
        ]);

        $res = $this->service->updateItemPhysicalQty($tenant_slug, $validated, (int) $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => $res['message'],
            'data'    => [
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
            'session_id' => ['required', 'integer'],
        ]);

        $submitted = $this->service->submitSessionForReview($tenant_slug, (int) $validated['session_id']);

        return response()->json([
            'success' => $submitted,
            'message' => $submitted
                ? 'Hasil penghitungan opname berhasil dikirim untuk proses review.'
                : 'Gagal mengirim sesi opname. Pastikan status sesi masih COUNTING.',
        ], $submitted ? 200 : 422);
    }
}
