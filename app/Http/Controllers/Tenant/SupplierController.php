<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\SupplierContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\SupplierRequest;
use App\Jobs\ExportSupplierExcelJob;
use App\Jobs\ExportSupplierPdfJob;
use App\Models\ExportLog;
use App\Models\Supplier;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    protected SupplierContract $service;

    public function __construct(SupplierContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $query = Supplier::where('tenant_id', $tenant->id);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('pic', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('tax_number', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $suppliers = $query->latest()->paginate($perPage)->withQueryString();

        $stats = [
            'total_suppliers' => Supplier::where('tenant_id', $tenant->id)->count(),
            'new_this_month'  => Supplier::where('tenant_id', $tenant->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'has_contact'     => Supplier::where('tenant_id', $tenant->id)
                ->where(function ($q) {
                    $q->whereNotNull('phone')->orWhereNotNull('email');
                })
                ->count(),
        ];

        return Inertia::render('Tenant/Contacts/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters'   => $request->only(['search', 'per_page']),
            'stats'     => $stats,
        ]);
    }

    public function getExportNotifications(string $tenant_slug): JsonResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $logs = ExportLog::where('tenant_id', $tenant->id)
            ->where('user_id', auth()->id())
            ->latest()
            ->take(10)
            ->get();

        return response()->json($logs);
    }

    public function exportPdf(string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Supplier_Report_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportSupplierPdfJob::dispatch($log->id);

        return back()->with('success', 'Added to export queue. Check the bell/download icon in the navbar.');
    }

    public function exportExcel(string $tenant_slug): RedirectResponse
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Supplier_Report_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportSupplierExcelJob::dispatch($log->id);

        return back()->with('success', 'Added to export queue. Check the bell/download icon in the navbar.');
    }

    public function create(string $tenant_slug): Response
    {
        return Inertia::render('Tenant/Contacts/Suppliers/Create');
    }

    public function store(SupplierRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->storeSupplier($tenant_slug, $request->validated());

        return to_route('tenant.contacts.suppliers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Supplier created successfully.');
    }

    public function show(string $tenant_slug, string $id): Response
    {
        $supplier = $this->service->getSupplierById($tenant_slug, $id);

        $supplier->load([
            'inbounds' => function ($query) {
                $query->with(['items.sku.product'])->latest()->limit(5);
            },
            'supplied_products' => function ($query) {
                $query->with(['sku.product'])->limit(10);
            }
        ]);

        return Inertia::render('Tenant/Contacts/Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit(string $tenant_slug, string $id): Response
    {
        $supplier = $this->service->getSupplierById($tenant_slug, $id);

        return Inertia::render('Tenant/Contacts/Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(SupplierRequest $request, string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->updateSupplier($tenant_slug, $id, $request->validated());

        return to_route('tenant.contacts.suppliers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->deleteSupplier($tenant_slug, $id);

        return to_route('tenant.contacts.suppliers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Supplier deleted successfully.');
    }
}
