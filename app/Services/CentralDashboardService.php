<?php

namespace App\Services;

use App\Contracts\CentralDashboardContract;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CentralDashboardService implements CentralDashboardContract
{
    public function getDashboardData(?string $period = '30_days'): array
    {
        $startDate = match ($period) {
            '7_days'  => Carbon::now()->subDays(7),
            '90_days' => Carbon::now()->subDays(90),
            '1_year'  => Carbon::now()->subYear(),
            default   => Carbon::now()->subDays(30),
        };

        // Format ekspresi tanggal berdasarkan Driver DB (PostgreSQL vs MySQL)
        $driverName = DB::connection()->getDriverName();
        $dateFormatRaw = match ($driverName) {
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM-DD')",
            'sqlite' => "STRFTIME('%Y-%m-%d', created_at)",
            default  => "DATE_FORMAT(created_at, '%Y-%m-%d')", // MySQL/MariaDB
        };

        // 1. KPI Stats Cards Data
        $totalTenants = Tenant::count();

        $hasStatusColumn = Schema::hasColumn('tenants', 'status');
        $activeTenants = $hasStatusColumn
            ? Tenant::where('status', 'active')->count()
            : $totalTenants;

        $hasSubStatus = Schema::hasColumn('subscriptions', 'status');
        $activeSubscriptions = $hasSubStatus
            ? Subscription::where('status', 'active')->count()
            : Subscription::count();

        $mrr = Subscription::query()
            ->when($hasSubStatus, function ($query) {
                $query->where('subscriptions.status', 'active');
            })
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->sum('plans.price');

        $totalUsers = User::whereNull('tenant_id')->count();

        $stats = [
            'total_tenants'        => $totalTenants,
            'active_tenants'       => $activeTenants,
            'active_subscriptions' => $activeSubscriptions,
            'monthly_mrr'          => (float) $mrr,
            'central_users_count'  => $totalUsers,
        ];

        // 2. Revenue Chart Data (Gunakan format dinamis sesuai PostgreSQL/MySQL)
        $revenueChart = Subscription::select(
            DB::raw("{$dateFormatRaw} as date"),
            DB::raw("COUNT(*) as total_subscriptions")
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 3. Tenant Growth Chart (Gunakan format dinamis sesuai PostgreSQL/MySQL)
        $tenantGrowthChart = Tenant::select(
            DB::raw("{$dateFormatRaw} as date"),
            DB::raw("COUNT(*) as total_registered")
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 4. Recent Tenants Table
        $recentTenantsQuery = Tenant::query();
        if (Schema::hasColumn('tenants', 'plan_id')) {
            $recentTenantsQuery->with('plan');
        }

        $selectColumns = ['id', 'name', 'slug', 'created_at'];
        if ($hasStatusColumn) {
            $selectColumns[] = 'status';
        }

        $recentTenants = $recentTenantsQuery
            ->latest()
            ->take(5)
            ->get($selectColumns);

        // 5. Recent Subscriptions Table
        $recentSubscriptions = Subscription::with(['tenant', 'plan'])
            ->latest()
            ->take(5)
            ->get();

        return [
            'stats'                => $stats,
            'revenue_chart'        => $revenueChart,
            'tenant_growth_chart' => $tenantGrowthChart,
            'recent_tenants'       => $recentTenants,
            'recent_subscriptions' => $recentSubscriptions,
            'period'               => $period,
        ];
    }
}
