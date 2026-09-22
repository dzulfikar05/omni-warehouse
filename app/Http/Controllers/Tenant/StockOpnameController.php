<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\StockOpnameContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockOpnameController extends Controller
{
    protected StockOpnameContract $service;

    public function __construct(StockOpnameContract $service)
    {
        $this->service = $service;
    }

    public function index(string $tenant_slug): Response
    {
        $data = $this->service->getActiveSessionData($tenant_slug);

        return Inertia::render('Tenant/WarehouseStocks/StockOpname/Index', [
            'session' => $data['session'],
            'items' => $data['items'],
        ]);
    }

    public function storeSession(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'warehouse_id' => 'required',
            'zone' => 'required',
            'audit_type' => 'required',
            'cut_off_date' => 'required',
        ]);

        $this->service->createSession($tenant_slug, $request->all());

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Sesi Stock Opname Baru berhasil diterbitkan!');
    }

    public function verifyCount(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'item_id' => 'required',
            'physical_qty' => 'required|numeric|min:0',
        ]);

        $this->service->updateItemPhysicalQty($tenant_slug, $request->all());

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Hasil hitung fisik berhasil disimpan!');
    }

    public function executeAdjustment(Request $request, string $tenant_slug): RedirectResponse
    {
        $request->validate([
            'session_id' => 'required',
        ]);

        $this->service->executeAdjustment($tenant_slug, (int) $request->input('session_id'));

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Adjustment stok berhasil dieksekusi ke database!');
    }
}
