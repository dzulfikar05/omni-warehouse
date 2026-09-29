<?php

namespace App\Contracts;

use App\Models\Tenant;

interface StockMovementReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array;
}
