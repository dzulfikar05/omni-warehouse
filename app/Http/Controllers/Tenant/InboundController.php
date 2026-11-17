<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\InboundContract;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Sku;
use App\Models\Supplier;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InboundController extends Controller
{
    protected InboundContract $service;

    public function __construct(InboundContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $filters = array_filter($request->only(['search', 'date_from', 'date_to', 'status', 'supplier_id']));
        $data = $this->service->getInboundManifestsList($tenant_slug, $filters);

        $masterSkus = Sku::whereHas('product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->with('product:id,name')
            ->get()
            ->map(fn($sku) => [
                'id' => $sku->id,
                'sku' => $sku->sku_code,
                'product_name' => $sku->product->name ?? '-',
            ]);

        return Inertia::render('Tenant/Transactions/Inbound/Index', [
            'manifests' => $data['manifests'],
            'summary' => $data['summary'],
            'statuses' => $data['statuses'],
            'suppliers' => Supplier::where('tenant_id', $tenant->id)->orderBy('name')->get(['id', 'name']),
            'masterSkus' => $masterSkus,
            'filters' => $request->only(['search', 'date_from', 'date_to', 'status', 'supplier_id']),
        ]);
    }

    public function store(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $validated = $request->validate([
            'supplier_id' => ['required', 'integer', Rule::exists('suppliers', 'id')->where('tenant_id', $tenant->id)],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku_id' => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.po_qty' => ['required', 'integer', 'min:1'],
        ]);

        $res = $this->service->createManifest($tenant_slug, $validated, auth()->id());

        return redirect()->route('tenant.transactions.inbound.show', [
            'tenant_slug' => $tenant_slug,
            'manifest_code' => $res['manifest_code']
        ])->with('success', __('Manifest Inbound PO berhasil dibuat.'));
    }

    public function show(string $tenant_slug, string $manifest_code): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->service->getManifestDetail($tenant_slug, $manifest_code);
        $locations = Location::where('tenant_id', $tenant->id)->where('is_active', true)->get(['id', 'rack_code', 'zone']);

        return Inertia::render('Tenant/Transactions/Inbound/Show', [
            'manifest' => $data['manifest'],
            'items' => $data['items'],
            'locations' => $locations,
        ]);
    }

    public function verifyBarcode(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'manifest_code' => 'required|string',
            'barcode' => 'required|string',
        ]);

        $res = $this->service->verifyBarcode($tenant_slug, $request->input('manifest_code'), $request->input('barcode'));

        if (!$res['success']) {
            return back()->with('error', $res['message']);
        }

        return back()->with('success', $res['message']);
    }

    public function updatePutaway(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'item_id' => 'required',
            'good_qty' => 'required|numeric|min:0',
            'damaged_qty' => 'required|numeric|min:0',
            'target_rack' => 'required|string',
            'damage_note' => 'nullable|string',
        ]);

        $res = $this->service->updatePutawayAllocation($tenant_slug, $request->all());

        return back()->with('success', $res['message']);
    }

    public function commit(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate(['manifest_code' => 'required|string']);
        $this->service->commitInbound($tenant_slug, $request->input('manifest_code'));

        return back()->with('success', __('Stok fisik berhasil di-commit ke rak gudang.'));
    }

    public function hold(Request $request, string $tenant_slug): RedirectResponse
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

        return back()->with('warning', __('Sesi inbound berhasil di-hold / ditunda.'));
    }

    public function resume(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate(['manifest_code' => 'required|string']);

        $this->service->resumeInboundSession(
            $tenant_slug,
            $request->input('manifest_code')
        );

        return back()->with('success', __('Sesi inbound berhasil dilanjutkan kembali.'));
    }
}
