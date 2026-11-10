<?php

namespace App\Http\Controllers\Api;

use App\Contracts\StockTransferContract;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StockTransferController extends Controller
{
    public function __construct(
        private readonly StockTransferContract $stockTransferService
    ) {}

    /**
     * Get master options for Stock Transfer form (warehouses, locations, skus with available stock).
     */
    public function options(string $tenant_slug): JsonResponse
    {
        $data = $this->stockTransferService->getTransferLogsList($tenant_slug, []);

        return response()->json([
            'success' => true,
            'message' => 'Opsi master stock transfer berhasil dimuat.',
            'data'    => [
                'warehouses' => $data['warehouses'],
                'locations'  => $data['locations'],
                'skus'       => $data['skus'],
            ],
        ]);
    }

    /**
     * Get paginated list of stock transfer logs with filters.
     */
    public function index(Request $request, string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $filters = $request->validate([
            'search'            => ['nullable', 'string', 'max:100'],
            'date_from'         => ['nullable', 'date'],
            'date_to'           => ['nullable', 'date', 'after_or_equal:date_from'],
            'status'            => ['nullable', Rule::in(['pending', 'in_transit', 'completed', 'cancelled', 'draft'])],
            'from_warehouse_id' => [
                'nullable',
                'integer',
                Rule::exists('warehouses', 'id')->where('tenant_id', $tenant->id),
            ],
            'to_warehouse_id'   => [
                'nullable',
                'integer',
                Rule::exists('warehouses', 'id')->where('tenant_id', $tenant->id),
            ],
        ]);

        $filters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $data = $this->stockTransferService->getTransferLogsList($tenant_slug, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat transfer stok berhasil dimuat.',
            'data'    => $data,
        ]);
    }

    /**
     * Create and execute a new stock transfer immediately.
     */
    public function store(Request $request, string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.sku_id'           => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.from_location_id' => ['required', 'integer', Rule::exists('locations', 'id')],
            'items.*.to_location_id'   => [
                'required',
                'integer',
                'different:items.*.from_location_id',
                Rule::exists('locations', 'id'),
            ],
            'items.*.quantity'         => ['required', 'integer', 'min:1'],
            'notes'                    => ['nullable', 'string', 'max:2000'],
        ]);

        $result = $this->stockTransferService->createStockTransfer(
            $tenant_slug,
            $validated,
            (int) $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data'    => [
                'transfer_code' => $result['transfer_code'],
            ],
        ], 201);
    }

    /**
     * Update an existing draft/pending stock transfer.
     */
    public function update(Request $request, string $tenant_slug, string $transfer_code): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.sku_id'           => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.from_location_id' => ['required', 'integer', Rule::exists('locations', 'id')],
            'items.*.to_location_id'   => [
                'required',
                'integer',
                'different:items.*.from_location_id',
                Rule::exists('locations', 'id'),
            ],
            'items.*.quantity'         => ['required', 'integer', 'min:1'],
            'items.*.batch_number'     => ['nullable', 'string', 'max:100'],
            'items.*.expiry_date'      => ['nullable', 'date'],
            'notes'                    => ['nullable', 'string', 'max:2000'],
        ]);

        $this->stockTransferService->updateStockTransfer($tenant_slug, $transfer_code, $validated);

        return response()->json([
            'success' => true,
            'message' => __('Draft transfer stok berhasil diperbarui.'),
        ]);
    }

    /**
     * Cancel stock transfer and reverse stock movement if completed.
     */
    public function cancel(Request $request, string $tenant_slug, string $transfer_code): JsonResponse
    {
        Tenant::where('slug', $tenant_slug)->firstOrFail();

        $this->stockTransferService->cancelStockTransfer(
            $tenant_slug,
            $transfer_code,
            (int) $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => __('Transfer stok berhasil dibatalkan dan stok telah dikembalikan ke rak asal.'),
        ]);
    }
}
