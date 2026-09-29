<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\StockSummaryReportContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\ReportFilterRequest;
use App\Models\Category;
use App\Models\Tenant;
use App\Models\Warehouse;
use Inertia\Inertia;
use Inertia\Response;

class StockSummaryReportController extends Controller
{
    public function __construct(protected StockSummaryReportContract $reportService) {}

    public function __invoke(ReportFilterRequest $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();

        $filters = $request->validated();
        $data = $this->reportService->getReportData($tenant, $filters);

        return Inertia::render('Tenant/Reports/StockSummary/Index', [
            'reports' => $data['reports'],
            'summary' => $data['summary'],
            'warehouses' => Warehouse::where('tenant_id', $tenant->id)->get(['id', 'name']),
            'categories' => Category::where('tenant_id', $tenant->id)->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }
}
