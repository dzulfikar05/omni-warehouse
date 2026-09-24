<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\InboundContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboundController extends Controller
{
    protected InboundContract $service;

    public function __construct(InboundContract $service)
    {
        $this->service = $service;
    }

    public function index(string $tenant_slug): Response
    {
        $data = $this->service->getInboundManifestsList($tenant_slug);

        return Inertia::render('Tenant/Transactions/Inbound/Index', [
            'manifests' => $data['manifests'],
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

        return back()->with('success', 'Hasil bongkar inbound berhasil disimpan ke rak & stok diperbarui!');
    }

    public function hold(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $this->service->holdInboundSession($tenant_slug, $request->input('reason', 'Penundaan Operator'));

        return back()->with('warning', 'Sesi bongkar muat inbound berhasil di-hold.');
    }
}
