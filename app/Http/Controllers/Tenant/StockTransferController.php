<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\StockTransferContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    protected StockTransferContract $stockTransferService;

    public function __construct(StockTransferContract $stockTransferService)
    {
        $this->stockTransferService = $stockTransferService;
    }

    public function index(string $tenant_slug): Response
    {
        $data = $this->stockTransferService->getTransferLogsList($tenant_slug);

        return Inertia::render('Tenant/Transactions/StockTransfer/Index', [
            'tenant_slug' => $tenant_slug,
            'transfers' => $data['transfers'],
            'warehouses' => $data['warehouses'],
            'locations' => $data['locations'],
            'skus' => $data['skus'],
            'summary' => $data['summary'],
        ]);
    }

    public function store(string $tenant_slug, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'sku_id' => 'required',
            'from_location_id' => 'required|different:to_location_id',
            'to_location_id' => 'required',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $res = $this->stockTransferService->createStockTransfer($tenant_slug, $validated);

        return redirect()->back()->with('success', $res['message']);
    }
}
