<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\StockOpnameContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StockOpnameRequest;
use App\Jobs\ExportStockOpnameExcelJob;
use App\Jobs\ExportStockOpnamePdfJob;
use App\Models\ExportLog;
use App\Models\Tenant;
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

    public function index(Request $request, string $tenant_slug): Response
    {
        $data = $this->service->getActiveSessionData($tenant_slug);

        return Inertia::render('Tenant/WarehouseStocks/StockOpname/Index', [
            'session' => $data['session'] ?? [],
            'items'   => $data['items'] ?? [],
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function storeSession(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->createSession($tenant_slug, $request->validated());

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Stocktake session created successfully.'));
    }

    public function verifyCount(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->updateItemPhysicalQty($tenant_slug, $request->validated());

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Physical count results saved successfully.'));
    }

    public function executeAdjustment(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $validated = $request->validated();
        $this->service->executeAdjustment($tenant_slug, (int) $validated['session_id']);

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Stock adjustment executed successfully.'));
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->service->getActiveSessionData($tenant_slug);

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'StockOpname_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportStockOpnamePdfJob::dispatch($log->id, $data);

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->service->getActiveSessionData($tenant_slug);

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'StockOpname_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportStockOpnameExcelJob::dispatch($log->id, $data);

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }
}
