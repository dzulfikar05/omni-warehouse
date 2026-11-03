<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\OutboundContract;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Sku;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OutboundController extends Controller
{
    protected OutboundContract $service;

    public function __construct(OutboundContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $filters = array_filter($request->only(['search', 'date_from', 'date_to', 'status', 'customer_id']));
        $data = $this->service->getOutboundManifestsList($tenant_slug, $filters);

        $masterSkus = Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with('product:id,name')
            ->get()
            ->map(fn($sku) => [
                'id'           => $sku->id,
                'sku'          => $sku->sku_code,
                'product_name' => $sku->product->name ?? '-',
            ]);

        return Inertia::render('Tenant/Transactions/Outbound/Index', [
            'manifests'  => $data['manifests'],
            'summary'    => $data['summary'],
            'statuses'   => $data['statuses'],
            'customers'  => Customer::where('tenant_id', $tenant->id)->orderBy('name')->get(['id', 'name']),
            'masterSkus' => $masterSkus,
            'filters'    => $request->only(['search', 'date_from', 'date_to', 'status', 'customer_id']),
        ]);
    }

    public function store(Request $request, string $tenant_slug): RedirectResponse
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

        return redirect()->route('tenant.transactions.outbound.show', [
            'tenant_slug'   => $tenant_slug,
            'manifest_code' => $res['manifest_code']
        ])->with('success', __('Manifest Outbound SO berhasil dibuat.'));
    }

    public function show(string $tenant_slug, string $manifest_code): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->service->getManifestDetail($tenant_slug, $manifest_code);
        $locations = Location::where('tenant_id', $tenant->id)->where('is_active', true)->get(['id', 'rack_code', 'zone']);

        return Inertia::render('Tenant/Transactions/Outbound/Show', [
            'manifest'  => $data['manifest'],
            'items'     => $data['items'],
            'locations' => $locations,
        ]);
    }

    public function verifyBarcode(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'barcode'       => 'required|string',
        ]);

        $res = $this->service->verifyBarcode($tenant_slug, $request->input('manifest_code'), $request->input('barcode'));

        if (!$res['success']) {
            return back()->with('error', $res['message']);
        }

        return back()->with('success', $res['message']);
    }

    public function updatePicking(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'item_id'        => 'required',
            'good_qty'       => 'required|numeric|min:0',
            'damaged_qty'    => 'required|numeric|min:0',
            'source_rack_id' => 'nullable',
            'damage_note'    => 'nullable|string',
        ]);

        $res = $this->service->updatePickingAllocation($tenant_slug, $request->all());

        return back()->with('success', $res['message']);
    }

    public function commit(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate(['manifest_code' => 'required|string']);
        $this->service->commitOutbound($tenant_slug, $request->input('manifest_code'));

        return back()->with('success', __('Stok fisik berhasil dipotong dan diposting dari rak gudang.'));
    }

    public function hold(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'reason'        => 'nullable|string',
        ]);

        $this->service->holdOutboundSession(
            $tenant_slug,
            $request->input('manifest_code'),
            $request->input('reason', 'Penundaan Operator Picking')
        );

        return back()->with('warning', __('Sesi outbound / picking berhasil di-hold / ditunda.'));
    }

    public function resume(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate(['manifest_code' => 'required|string']);

        $this->service->resumeOutboundSession(
            $tenant_slug,
            $request->input('manifest_code')
        );

        return back()->with('success', __('Sesi outbound / picking berhasil dilanjutkan kembali.'));
    }
}
