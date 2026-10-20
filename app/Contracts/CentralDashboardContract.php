<?php

namespace App\Contracts;

interface CentralDashboardContract
{
    /**
     * Get analytical stats & metric summary for Central Dashboard.
     */
    public function getDashboardData(?string $period = '30_days'): array;
}
