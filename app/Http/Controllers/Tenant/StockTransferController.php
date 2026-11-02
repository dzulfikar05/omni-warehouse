<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\StockTransferContract;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    protected StockTransferContract $stockTransferService;

    public function __construct(StockTransferContract $stockTransferService)
    {
        $this->stockTransferService = $stockTransferService;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'status' => ['nullable', 'string', 'max:50'],
            'from_warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('tenant_id', $tenant->id)],
            'to_warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('tenant_id', $tenant->id)],
        ]);
        $filters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $data = $this->stockTransferService->getTransferLogsList($tenant_slug, $filters);

        return Inertia::render('Tenant/Transactions/StockTransfer/Index', [
            'tenant_slug' => $tenant_slug,
            'transfers' => $data['transfers'],
            'warehouses' => $data['warehouses'],
            'locations' => $data['locations'],
            'skus' => $data['skus'],
            'summary' => $data['summary'],
            'statuses' => $data['statuses'],
            'filters' => $request->only(['search', 'date_from', 'date_to', 'status', 'from_warehouse_id', 'to_warehouse_id']),
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

            return redirect()->back()->with('success', __($res['message']));
        } catch (\Exception $e) {
            return redirect()->back()->with('error', __($e->getMessage()));
        }
    }
}
