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
    public function __construct(private readonly StockTransferContract $stockTransferService) {}

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'status' => ['nullable', Rule::in(['pending', 'in_transit', 'completed', 'cancelled', 'draft'])],
            'from_warehouse_id' => [
                'nullable',
                'integer',
                Rule::exists('warehouses', 'id')->where('tenant_id', $tenant->id),
            ],
            'to_warehouse_id' => [
                'nullable',
                'integer',
                Rule::exists('warehouses', 'id')->where('tenant_id', $tenant->id),
            ],
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
            'filters' => $request->only([
                'search',
                'date_from',
                'date_to',
                'status',
                'from_warehouse_id',
                'to_warehouse_id',
            ]),
        ]);
    }

    public function store(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku_id' => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.from_location_id' => ['required', 'integer', Rule::exists('locations', 'id')],
            'items.*.to_location_id' => [
                'required',
                'integer',
                'different:items.*.from_location_id',
                Rule::exists('locations', 'id'),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $result = $this->stockTransferService->createStockTransfer(
            $tenant_slug,
            $validated,
            (int) $request->user()->id
        );

        return back()->with('success', $result['message']);
    }

    public function update(Request $request, string $tenant_slug, string $transfer_code): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku_id' => ['required', 'integer', Rule::exists('skus', 'id')],
            'items.*.from_location_id' => ['required', 'integer', Rule::exists('locations', 'id')],
            'items.*.to_location_id' => [
                'required',
                'integer',
                'different:items.*.from_location_id',
                Rule::exists('locations', 'id'),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.batch_number' => ['nullable', 'string', 'max:100'],
            'items.*.expiry_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $this->stockTransferService->updateStockTransfer($tenant_slug, $transfer_code, $validated);

        return back()->with('success', __('Draft stock transfer updated successfully.'));
    }

    public function cancel(Request $request, string $tenant_slug, string $transfer_code): RedirectResponse
    {
        Tenant::where('slug', $tenant_slug)->firstOrFail();
        $this->stockTransferService->cancelStockTransfer(
            $tenant_slug,
            $transfer_code,
            (int) $request->user()->id
        );

        return back()->with('success', __('Stock transfer cancelled. Completed transfer stock was reversed.'));
    }
}
