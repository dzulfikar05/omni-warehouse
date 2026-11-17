<?php

namespace App\Http\Controllers\Api;

use App\Contracts\InboundContract;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Sku;
use App\Models\Supplier;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InboundController extends Controller
{
    protected InboundContract $service;

    public function __construct(InboundContract $service)
    {
        $this->service = $service;
    }

    public function options(string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $suppliers = Supplier::where('tenant_id', $tenant->id)
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
            'message' => 'Opsi master inbound berhasil dimuat.',
            'data' => [
                'suppliers' => $suppliers,
                'products' => $products,
                'available_racks' => $locations->isEmpty()
                    ? ['RACK-A1-01', 'RACK-A1-02', 'RACK-B1-01']
                    : $locations,
            ]
        ]);
    }

    public function index(Request $request, string $tenant_slug): JsonResponse
    {
        $filters = array_filter($request->only(['search', 'date_from', 'date_to', 'status', 'supplier_id']));
        $data = $this->service->getInboundManifestsList($tenant_slug, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Daftar manifes inbound berhasil dimuat.',
            'data' => [
                'summary' => $data['summary'],
                'statuses' => $data['statuses'],
                'manifests' => $data['manifests'],
            ]
        ]);
    }

    public function store(Request $request, string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'supplier_id' => ['required', 'integer', Rule::exists('suppliers', 'id')->where('tenant_id', $tenant->id)],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku_id' => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.po_qty' => ['required', 'integer', 'min:1'],
        ]);

        $res = $this->service->createManifest($tenant_slug, $validated, auth()->id() ?? 1);

        return response()->json([
            'success' => true,
            'message' => 'Manifest Inbound PO berhasil dibuat.',
            'data' => $res
        ], 201);
    }

    public function show(string $tenant_slug, string $manifest_code): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->service->getManifestDetail($tenant_slug, $manifest_code);
        $locations = Location::where('tenant_id', $tenant->id)->where('is_active', true)->get(['id', 'rack_code', 'zone']);

        return response()->json([
            'success' => true,
            'message' => 'Detail manifest ditemukan.',
            'data' => [
                'manifest' => $data['manifest'],
                'items' => $data['items'],
                'available_locations' => $locations,
            ]
        ]);
    }

    public function verifyBarcode(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'barcode' => 'required|string',
        ]);

        $res = $this->service->verifyBarcode($tenant_slug, $request->input('manifest_code'), $request->input('barcode'));

        if (!$res['success']) {
            return response()->json(['success' => false, 'message' => $res['message']], 422);
        }

        return response()->json(['success' => true, 'message' => $res['message']]);
    }

    public function updatePutaway(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate([
            'item_id' => 'required',
            'good_qty' => 'required|numeric|min:0',
            'damaged_qty' => 'required|numeric|min:0',
            'target_rack' => 'required|string',
            'damage_note' => 'nullable|string',
        ]);

        $res = $this->service->updatePutawayAllocation($tenant_slug, $request->all());

        return response()->json(['success' => true, 'message' => $res['message']]);
    }

    public function commit(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate(['manifest_code' => 'required|string']);
        $this->service->commitInbound($tenant_slug, $request->input('manifest_code'));

        return response()->json(['success' => true, 'message' => 'Stok fisik berhasil di-commit ke rak gudang.']);
    }

    public function hold(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $this->service->holdInboundSession(
            $tenant_slug,
            $request->input('manifest_code'),
            $request->input('reason', 'Penundaan Operator')
        );

        return response()->json(['success' => true, 'message' => 'Sesi inbound berhasil di-hold / ditunda.']);
    }

    public function resume(Request $request, string $tenant_slug): JsonResponse
    {
        $request->validate(['manifest_code' => 'required|string']);

        $this->service->resumeInboundSession(
            $tenant_slug,
            $request->input('manifest_code')
        );

        return response()->json(['success' => true, 'message' => 'Sesi inbound berhasil dilanjutkan kembali.']);
    }



    public function scanItem(Request $request, string $tenant_slug): JsonResponse
    {
        return $this->verifyBarcode($request, $tenant_slug);
    }


}
