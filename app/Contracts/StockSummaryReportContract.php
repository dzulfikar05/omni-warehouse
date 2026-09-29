<?php

namespace App\Contracts;

use App\Models\Tenant;

interface StockSummaryReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array;
}
