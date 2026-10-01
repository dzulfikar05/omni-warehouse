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
            'items' => 'required|array|min:1',
            'items.*.sku_id' => 'required',
            'items.*.from_location_id' => 'required|different:items.*.to_location_id',
            'items.*.to_location_id' => 'required',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        try {
            $res = $this->stockTransferService->createStockTransfer($tenant_slug, $validated);
            return redirect()->back()->with('success', $res['message']);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
