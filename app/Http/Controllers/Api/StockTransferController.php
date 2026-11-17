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
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $warehouses = \App\Models\Warehouse::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        $locations = \App\Models\Location::whereHas('warehouse', fn($q) => $q->where('tenant_id', $tenant->id)->where('is_active', true))
            ->with('warehouse:id,name')
            ->where('is_active', true)
            ->orderBy('zone')
            ->orderBy('rack_code')
            ->get()
            ->map(fn($loc) => [
                'id'             => $loc->id,
                'warehouse_id'   => $loc->warehouse_id,
                'warehouse_name' => $loc->warehouse->name ?? '-',
                'rack_code'      => $loc->rack_code,
                'zone'           => $loc->zone,
                'label'          => $loc->zone ? "{$loc->zone} - {$loc->rack_code}" : $loc->rack_code,
            ]);

        // Query SKU aktif yang memiliki stok fisik di gudang
        $skuItems = \App\Models\Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->whereHas('inventoryStocks', fn($q) => $q->where('quantity', '>', 0))
            ->with([
                'product:id,name',
                'inventoryStocks' => fn($q) => $q->where('quantity', '>', 0)->select('id', 'sku_id', 'location_id', 'quantity', 'batch_number', 'expiry_date'),
            ])
            ->where('is_active', true)
            ->get()
            ->map(function ($sku) {
                $stockByLocation = $sku->inventoryStocks
                    ->groupBy('location_id')
                    ->map(fn($stocks, $locationId) => [
                        'location_id' => (int) $locationId,
                        'quantity'    => (int) $stocks->sum('quantity'),
                    ])
                    ->values();

                return [
                    'id'            => $sku->id,
                    'code'          => $sku->sku_code,
                    'sku'           => $sku->sku_code,
                    'barcode'       => $sku->barcode ?? $sku->sku_code,
                    'name'          => $sku->product->name ?? '-',
                    'current_stock' => (int) $sku->inventoryStocks->sum('quantity'),
                    'locations'     => $stockByLocation,
                ];
            });

        $rackCodes = $locations->pluck('rack_code');

        return response()->json([
            'success' => true,
            'message' => 'Opsi master stock transfer berhasil dimuat.',
            'data'    => [
                'warehouses'      => $warehouses,
                'locations'       => $locations,
                'skus'            => $skuItems,
                'products'        => $skuItems,
                'available_racks' => $rackCodes->isEmpty()
                    ? ['RACK-A1-01', 'RACK-A1-02', 'RACK-B1-01']
                    : $rackCodes,
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
            'status'            => ['nullable', 'string', 'max:30'],
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

        $filters = array_filter($filters, fn($value) => $value !== null && $value !== '');
        $rawData = $this->stockTransferService->getTransferLogsList($tenant_slug, $filters);

        $transfersPaginator = $rawData['transfers'] ?? null;
        $isPaginator = $transfersPaginator instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator;

        $responseData = [
            'transfers' => $isPaginator ? $transfersPaginator->items() : ($transfersPaginator ?? []),
            'stats'     => $rawData['stats'] ?? null,
        ];

        if ($isPaginator) {
            $responseData['pagination'] = [
                'current_page' => $transfersPaginator->currentPage(),
                'last_page'    => $transfersPaginator->lastPage(),
                'per_page'     => $transfersPaginator->perPage(),
                'total'        => $transfersPaginator->total(),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat transfer stok berhasil dimuat.',
            'data'    => $responseData,
        ]);
    }

    /**
     * Create and execute a new stock transfer immediately.
     */
    public function store(Request $request, string $tenant_slug): JsonResponse
    {
        Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'local_uuid'               => ['nullable', 'string', 'max:100'],
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

        $result = $this->stockTransferService->createStockTransfer(
            $tenant_slug,
            $validated,
            (int) $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data'    => [
                'transfer_code'  => $result['transfer_code'],
                'already_synced' => $result['already_synced'] ?? false,
            ],
        ], 201);
    }

    /**
     * Synchronize offline-created stock transfer queue from mobile SQLite (Idempotent & FIFO).
     */
    public function syncOffline(Request $request, string $tenant_slug): JsonResponse
    {
        Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'transfer_code'            => ['nullable', 'string', 'max:100'],
            'local_uuid'               => ['nullable', 'string', 'max:100'],
            'transaction_uuid'         => ['nullable', 'string', 'max:100'],
            'notes'                    => ['nullable', 'string', 'max:2000'],
            'client_timestamp'         => ['nullable', 'string'],
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.sku_id'           => ['required', 'integer'],
            'items.*.from_location_id' => ['nullable', 'integer'],
            'items.*.to_location_id'   => ['nullable', 'integer'],
            'items.*.from_rack'        => ['nullable', 'string'],
            'items.*.to_rack'          => ['nullable', 'string'],
            'items.*.quantity'         => ['required', 'integer', 'min:1'],
            'items.*.batch_number'     => ['nullable', 'string', 'max:100'],
            'items.*.expiry_date'      => ['nullable', 'date'],
        ]);

        $result = $this->stockTransferService->syncOfflineTransfer(
            $tenant_slug,
            $validated,
            (int) $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data'    => $result,
        ]);
    }

    /**
     * Update an existing draft/pending stock transfer.
     */
    public function update(Request $request, string $tenant_slug, string $transfer_code): JsonResponse
    {
        Tenant::where('slug', $tenant_slug)->firstOrFail();

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
