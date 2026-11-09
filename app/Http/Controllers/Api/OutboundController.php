<?php

namespace App\Http\Controllers\Api;

use App\Contracts\OutboundContract;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Sku;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OutboundController extends Controller
{
    protected OutboundContract $service;

    public function __construct(OutboundContract $service)
    {
        $this->service = $service;
    }

    public function options(string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $customers = Customer::where('tenant_id', $tenant->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with('product:id,name')
            ->where('is_active', true)
            ->get()
            ->map(fn($sku) => [
                'id' => $sku->id,
                'sku' => $sku->sku_code,
                'barcode' => $sku->barcode ?? $sku->sku_code,
                'name' => $sku->product->name ?? '-',
            ]);

        $locations = Location::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->pluck('rack_code');

        return response()->json([
            'success' => true,
            'message' => 'Opsi master outbound berhasil dimuat.',
            'data' => [
                'customers' => $customers,
                'products' => $products,
                'available_racks' => $locations->isEmpty()
                    ? ['RACK-A1-01', 'RACK-A1-02', 'RACK-B1-01']
                    : $locations,
            ]
        ]);
    }

    public function index(Request $request, string $tenant_slug): JsonResponse
    {
        $filters = array_filter($request->only(['search', 'date_from', 'date_to', 'status', 'customer_id']));
        $data = $this->service->getOutboundManifestsList($tenant_slug, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Daftar manifes outbound berhasil dimuat.',
            'data'    => $data,
        ]);
    }

    public function store(Request $request, string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'customer_id'    => ['required', 'integer', Rule::exists('customers', 'id')->where('tenant_id', $tenant->id)],
            'vehicle_no'     => ['nullable', 'string'],
            'driver_name'    => ['nullable', 'string'],
            'notes'          => ['nullable', 'string'],
            'items'          => ['required', 'array', 'min:1'],
            'items.*.sku_id' => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.so_qty' => ['required', 'integer', 'min:1'],
        ]);

        $res = $this->service->createManifest($tenant_slug, $validated, auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Manifest Outbound SO berhasil dibuat.',
            'data'    => $res,
        ], 201);
    }

    public function show(string $tenant_slug, string $manifest_code): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->service->getManifestDetail($tenant_slug, $manifest_code);
        $locations = Location::where('tenant_id', $tenant->id)->where('is_active', true)->get(['id', 'rack_code', 'zone']);

        return response()->json([
            'success' => true,
            'message' => 'Detail manifes outbound berhasil dimuat.',
            'data'    => [
                'manifest'  => $data['manifest'],
                'items'     => $data['items'],
                'locations' => $locations,
            ],
        ]);
    }

    public function verifyBarcode(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'barcode'       => 'required|string',
        ]);

        $res = $this->service->verifyBarcode($tenant_slug, $request->input('manifest_code'), $request->input('barcode'));

        return response()->json([
            'success' => $res['success'],
            'message' => $res['message'],
        ], $res['success'] ? 200 : 422);
    }

    public function updatePicking(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate([
            'item_id'        => 'required',
            'good_qty'       => 'required|numeric|min:0',
            'damaged_qty'    => 'required|numeric|min:0',
            'source_rack_id' => 'nullable',
            'damage_note'    => 'nullable|string',
        ]);

        $res = $this->service->updatePickingAllocation($tenant_slug, $request->all());

        return response()->json([
            'success' => $res['success'],
            'message' => $res['message'],
        ]);
    }

    public function commit(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate(['manifest_code' => 'required|string']);
        $res = $this->service->commitOutbound($tenant_slug, $request->input('manifest_code'));

        return response()->json([
            'success' => $res['success'] ?? true,
            'message' => $res['message'] ?? __('Stok fisik berhasil dipotong dan diposting dari rak gudang.'),
        ]);
    }

    public function hold(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'reason'        => 'nullable|string',
        ]);

        $res = $this->service->holdOutboundSession(
            $tenant_slug,
            $request->input('manifest_code'),
            $request->input('reason', 'Penundaan Operator Picking')
        );

        return response()->json([
            'success' => $res['success'],
            'message' => $res['message'],
        ]);
    }

    public function resume(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate(['manifest_code' => 'required|string']);

        $res = $this->service->resumeOutboundSession(
            $tenant_slug,
            $request->input('manifest_code')
        );

        return response()->json([
            'success' => $res['success'],
            'message' => $res['message'],
        ]);
    }
}
