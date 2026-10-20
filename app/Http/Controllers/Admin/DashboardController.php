<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\CentralDashboardContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected CentralDashboardContract $dashboardService;

    public function __construct(CentralDashboardContract $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request): Response
    {
        $period = $request->input('period', '30_days');
        $data   = $this->dashboardService->getDashboardData($period);

        return Inertia::render('Dashboard', $data);
    }
}
