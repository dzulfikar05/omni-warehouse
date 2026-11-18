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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
        $validated = $request->validate([
            'session_id' => 'nullable|integer',
        ]);
        $data = isset($validated['session_id'])
            ? $this->service->getSessionData($tenant_slug, (int) $validated['session_id'])
            : ['session' => null, 'items' => []];
        if (isset($validated['session_id'])) {
            abort_unless($data['session'], 404);
        }

        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $warehouses = DB::table('warehouses')
            ->where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(function ($warehouse) {
                $warehouse->locations = DB::table('locations')
                    ->where('warehouse_id', $warehouse->id)
                    ->where('is_active', true)
                    ->orderBy('rack_code')
                    ->get(['id', 'rack_code', 'zone']);

                return $warehouse;
            });
        $itemSummary = DB::table('transaction_items')
            ->select('transaction_id')
            ->selectRaw('COUNT(*) as total_items')
            ->selectRaw('SUM(CASE WHEN counted_at IS NOT NULL THEN 1 ELSE 0 END) as counted_items')
            ->groupBy('transaction_id');
        $warehouseSummary = DB::table('transaction_items')
            ->join('locations', 'transaction_items.from_location_id', '=', 'locations.id')
            ->join('warehouses', 'locations.warehouse_id', '=', 'warehouses.id')
            ->select('transaction_items.transaction_id')
            ->selectRaw('MIN(warehouses.name) as fallback_warehouse_name')
            ->selectRaw('MIN(warehouses.code) as fallback_warehouse_code')
            ->groupBy('transaction_items.transaction_id');
        $sessions = DB::table('transactions')
            ->leftJoin('users', 'transactions.created_by', '=', 'users.id')
            ->leftJoin('warehouses', 'transactions.warehouse_id', '=', 'warehouses.id')
            ->leftJoin('locations as opname_location', 'transactions.location_id', '=', 'opname_location.id')
            ->leftJoinSub($itemSummary, 'item_summary', function ($join) {
                $join->on('transactions.id', '=', 'item_summary.transaction_id');
            })
            ->leftJoinSub($warehouseSummary, 'warehouse_summary', function ($join) {
                $join->on('transactions.id', '=', 'warehouse_summary.transaction_id');
            })
            ->where('transactions.tenant_id', $tenant->id)
            ->where('transactions.transaction_type', 'STOCK_OPNAME')
            ->select(
                'transactions.id',
                'transactions.local_uuid as session_code',
                'transactions.status',
                'transactions.dock_bay as zone',
                'opname_location.rack_code as location_rack',
                'opname_location.zone as location_zone',
                'transactions.created_at',
                'users.name as auditor_name',
                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
                'warehouse_summary.fallback_warehouse_name',
                'warehouse_summary.fallback_warehouse_code',
                'item_summary.total_items',
                'item_summary.counted_items'
            )
            ->latest('transactions.created_at')
            ->paginate(15)
            ->withQueryString();
        $sessions->getCollection()->transform(function ($session) {
            $session->status = strtoupper($session->status);
            $session->warehouse_name = $session->warehouse_name ?? $session->fallback_warehouse_name ?? '-';
            $session->warehouse_code = $session->warehouse_code ?? $session->fallback_warehouse_code ?? '-';
            $session->location_label = $session->location_rack
                ? $session->location_rack.($session->location_zone ? ' · '.$session->location_zone : '')
                : (in_array(strtolower(trim((string) $session->zone)), ['', 'all', 'all zones', 'semua zona', 'semua lokasi'], true)
                    ? 'Semua lokasi'
                    : 'Zona '.$session->zone);
            $session->total_items = (int) ($session->total_items ?? 0);
            $session->counted_items = (int) ($session->counted_items ?? 0);

            return $session;
        });

        return Inertia::render('Tenant/WarehouseStocks/StockOpname/Index', [
            'session' => $data['session'],
            'items' => $data['items'],
            'warehouses' => $warehouses,
            'sessions' => $sessions,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function storeSession(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->createSession($tenant_slug, $request->validated(), (int) auth()->id());

        return to_route('tenant.stock-opname.index', ['tenant_slug' => $tenant_slug])
            ->with('success', __('Sesi opname berhasil ditambahkan.'));
    }

    public function scanSku(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $validated = $request->validated();
        $added = $this->service->syncScannedSkuToSession(
            $tenant_slug,
            (int) $validated['session_id'],
            $validated['barcode'],
            (int) auth()->id()
        );

        return to_route('tenant.stock-opname.index', [
            'tenant_slug' => $tenant_slug,
            'session_id' => $validated['session_id'],
        ])->with('success', $added > 0
                ? __('SKU stock was added to the active stocktake session.')
                : __('The SKU is already included in the active stocktake session.'));
    }

    public function verifyCount(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $result = $this->service->updateItemPhysicalQty($tenant_slug, $request->validated(), (int) auth()->id());

        return to_route('tenant.stock-opname.index', [
            'tenant_slug' => $tenant_slug,
            'session_id' => $result['session_id'],
        ])
            ->with('success', __('Physical count results saved successfully.'));
    }

    public function executeAdjustment(StockOpnameRequest $request, string $tenant_slug): RedirectResponse
    {
        $validated = $request->validated();
        if (! $this->service->executeAdjustment($tenant_slug, (int) $validated['session_id'], (int) auth()->id())) {
            throw ValidationException::withMessages([
                'session_id' => __('The stocktake session could not be adjusted.'),
            ]);
        }

        return to_route('tenant.stock-opname.index', [
            'tenant_slug' => $tenant_slug,
            'session_id' => $validated['session_id'],
        ])
            ->with('success', __('Stock adjustment executed successfully.'));
    }

    public function exportPdf(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->exportData($request, $tenant_slug);

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => auth()->id(),
            'type' => 'pdf',
            'filename' => 'StockOpname_'.date('Ymd_His').'.pdf',
            'status' => 'pending',
        ]);

        ExportStockOpnamePdfJob::dispatch($log->id, $data);

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }

    public function exportExcel(Request $request, string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $data = $this->exportData($request, $tenant_slug);

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => auth()->id(),
            'type' => 'excel',
            'filename' => 'StockOpname_'.date('Ymd_His').'.xlsx',
            'status' => 'pending',
        ]);

        ExportStockOpnameExcelJob::dispatch($log->id, $data);

        return back()->with('success', __('Export added to the queue. Check the notification or download icon in the navigation bar.'));
    }

    private function exportData(Request $request, string $tenantSlug): array
    {
        $validated = $request->validate([
            'session_id' => 'nullable|integer',
        ]);
        $data = isset($validated['session_id'])
        ? $this->service->getSessionData($tenantSlug, (int) $validated['session_id'])
        : $this->service->getActiveSessionData($tenantSlug);

        abort_unless($data['session'], 404);

        return $data;
    }
}
