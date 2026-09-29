<?php

namespace App\Contracts;

use App\Models\Tenant;

interface ValuationAssetReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array;
}
