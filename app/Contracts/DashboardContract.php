<?php

namespace App\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

interface DashboardContract
{
    public function getSummaryStats(int $tenantId): array;
    public function getStockMovementTrend(int $tenantId, int $months = 6): array;
    public function getInboundVsOutboundComparison(int $tenantId): array;
    public function getLowStockAlerts(int $tenantId, int $limit = 5): array;
    public function getRecentStockMovements(int $tenantId, int $limit = 5): array;
}
