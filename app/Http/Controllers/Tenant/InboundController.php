<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\InboundContract;
use App\Http\Controllers\Controller;
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
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'status' => ['nullable', 'string', 'max:50'],
            'supplier_id' => ['nullable', 'integer', Rule::exists('suppliers', 'id')->where('tenant_id', $tenant->id)],
        ]);
        $filters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $data = $this->service->getInboundManifestsList($tenant_slug, $filters);

        return Inertia::render('Tenant/Transactions/Inbound/Index', [
            'manifests' => $data['manifests'],
            'summary' => $data['summary'],
            'statuses' => $data['statuses'],
            'suppliers' => Supplier::where('tenant_id', $tenant->id)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'date_from', 'date_to', 'status', 'supplier_id']),
        ]);
    }

    public function show(string $tenant_slug, string $manifest_code): Response
    {
        $data = $this->service->getManifestDetail($tenant_slug, $manifest_code);

        return Inertia::render('Tenant/Transactions/Inbound/Show', [
            'manifest' => $data['manifest'],
            'items' => $data['items'],
        ]);
    }

    public function verifyBarcode(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'barcode' => 'required|string',
        ]);

        $res = $this->service->verifyBarcode($tenant_slug, $request->input('barcode'));

        return back()->with('success', $res['message']);
    }

    public function updatePutaway(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'item_id' => 'required',
            'good_qty' => 'required|numeric|min:0',
            'damaged_qty' => 'required|numeric|min:0',
            'target_rack' => 'required|string',
        ]);

        $res = $this->service->updatePutawayAllocation($tenant_slug, $request->all());

        return back()->with('success', $res['message']);
    }

    public function commit(string $tenant_slug): RedirectResponse
    {
        $this->service->commitInbound($tenant_slug);

        return back()->with('success', __('Inbound unloading results saved successfully. Storage locations and stock have been updated.'));
    }

    public function hold(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $this->service->holdInboundSession($tenant_slug, $request->input('reason', 'Penundaan Operator'));

        return back()->with('warning', __('Inbound unloading session put on hold successfully.'));
    }
}
