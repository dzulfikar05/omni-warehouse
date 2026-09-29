<?php

namespace App\Contracts;

use App\Models\Tenant;

interface InboundOutboundReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array;
}
