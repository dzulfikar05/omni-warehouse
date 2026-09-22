<?php

namespace App\Services;

use App\Contracts\StockOpnameContract;
use App\Models\Tenant;

class StockOpnameService implements StockOpnameContract
{
    public function getActiveSessionData(string $tenantSlug): array
    {
        $tenant = Tenant::where('slug', $tenantSlug)->first();
        $tenantName = $tenant ? $tenant->name : 'Gudang Utama';

        $session = [
            'id' => 0,
            'session_code' => 'TX-OPN-NONE',
            'status' => 'DRAFT',
            'warehouse_name' => $tenantName,
            'warehouse_code' => 'DC-MAIN-01',
            'zone' => 'Belum Ada Sesi Audit',
            'auditor_name' => '-',
            'auditor_avatar' => '-',
            'cut_off_date' => '-',
            'total_skus' => 0,
            'total_system_units' => 0,
            'matched_skus' => 0,
            'deficit_units' => 0,
            'surplus_units' => 0,
            'net_variance' => 0,
        ];

        $items = [];

        return [
            'session' => $session,
            'items' => $items,
        ];
    }

    public function createSession(string $tenantSlug, array $data): bool
    {
        return true;
    }

    public function updateItemPhysicalQty(string $tenantSlug, array $data): bool
    {
        return true;
    }

    public function executeAdjustment(string $tenantSlug, int $sessionId): bool
    {
        return true;
    }
}
