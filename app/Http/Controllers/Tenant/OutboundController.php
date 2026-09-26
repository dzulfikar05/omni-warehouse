<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\OutboundContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OutboundController extends Controller
{
    protected OutboundContract $service;

    public function __construct(OutboundContract $service)
    {
        $this->service = $service;
    }

    public function index(string $tenant_slug): Response
    {
        $data = $this->service->getOutboundManifestsList($tenant_slug);

        return Inertia::render('Tenant/Transactions/Outbound/Index', [
            'manifests' => $data['manifests'],
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

        return back()->with('success', 'Hasil packing & outbound berhasil disubmit, stok live dipotong!');
    }

    public function hold(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $this->service->holdOutboundSession($tenant_slug, $request->input('reason', 'Penundaan Armada Pengiriman'));

        return back()->with('warning', 'Sesi outbound pengiriman berhasil di-hold.');
    }
}
