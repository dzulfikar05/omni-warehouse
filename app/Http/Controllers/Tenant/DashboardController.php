<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\DashboardContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardContract $dashboardService
    ) {}

    public function index(Request $request): Response
    {
        $tenant = app('current_tenant');
        $user = auth()->user();

        $stats = $user->can('tenant.dashboard.stats_cards')
            ? $this->dashboardService->getSummaryStats($tenant->id)
            : null;

        $movementTrend = $user->can('tenant.dashboard.stock_trend_chart')
            ? $this->dashboardService->getStockMovementTrend($tenant->id)
            : [];

        $comparison = $user->can('tenant.dashboard.inbound_outbound_chart')
            ? $this->dashboardService->getInboundVsOutboundComparison($tenant->id)
            : [];

        $lowStockAlerts = $user->can('tenant.dashboard.low_stock_table')
            ? $this->dashboardService->getLowStockAlerts($tenant->id)
            : [];

        $recentMovements = $user->can('tenant.dashboard.recent_movements_table')
            ? $this->dashboardService->getRecentStockMovements($tenant->id)
            : [];

        return Inertia::render('Tenant/Dashboard/Index', [
            'stats'            => $stats,
            'movementTrend'    => $movementTrend,
            'comparison'       => $comparison,
            'lowStockAlerts'   => $lowStockAlerts,
            'recentMovements'  => $recentMovements,
        ]);
    }
}
