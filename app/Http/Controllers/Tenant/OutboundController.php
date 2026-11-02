<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\OutboundContract;
use App\Http\Controllers\Controller;
use App\Models\Customer;
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
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'status' => ['nullable', 'string', 'max:50'],
            'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('tenant_id', $tenant->id)],
        ]);
        $filters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $data = $this->service->getOutboundManifestsList($tenant_slug, $filters);

        return Inertia::render('Tenant/Transactions/Outbound/Index', [
            'manifests' => $data['manifests'],
            'summary' => $data['summary'],
            'statuses' => $data['statuses'],
            'customers' => Customer::where('tenant_id', $tenant->id)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'date_from', 'date_to', 'status', 'customer_id']),
        ]);
    }

    public function show(string $tenant_slug, string $manifest_code): Response
    {
        $data = $this->service->getManifestDetail($tenant_slug, $manifest_code);

        return Inertia::render('Tenant/Transactions/Outbound/Show', [
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

    public function updatePacking(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'item_id' => 'required',
            'picked_qty' => 'required|numeric|min:0',
            'packed_qty' => 'required|numeric|min:0',
        ]);

        $res = $this->service->updatePackingAllocation($tenant_slug, $request->all());

        return back()->with('success', $res['message']);
    }

    public function commit(string $tenant_slug): RedirectResponse
    {
        $this->service->commitOutbound($tenant_slug);

        return back()->with('success', __('Outbound packing results submitted successfully. Live stock has been updated.'));
    }

    public function hold(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $this->service->holdOutboundSession($tenant_slug, $request->input('reason', 'Penundaan Armada Pengiriman'));

        return back()->with('warning', __('Outbound shipping session put on hold successfully.'));
    }
}
