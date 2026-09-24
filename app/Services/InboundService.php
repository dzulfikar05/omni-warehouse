<?php

namespace App\Services;

use App\Contracts\InboundContract;
use App\Models\Tenant;

class InboundService implements InboundContract
{
    public function getInboundManifestsList(string $tenant_slug): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();
        $tenantName = $tenant ? $tenant->name : 'Gudang Utama';

        return [
            'manifests' => [],
        ];
    }

    public function getManifestDetail(string $tenant_slug, string $manifest_code): array
    {
        $tenant = Tenant::where('slug', $tenant_slug)->first();
        $tenantName = $tenant ? $tenant->name : 'Gudang Utama';

        return [
            'manifest' => [
                'manifest_code' => $manifest_code,
                'status' => 'DRAFT',
                'supplier_name' => '-',
                'vehicle_no' => '-',
                'vehicle_type' => '-',
                'driver_name' => '-',
                'driver_phone' => '-',
                'warehouse_name' => $tenantName,
                'dock_bay' => 'BAY-01',
                'operator_name' => 'Operator Gudang',
                'operator_initials' => 'OP',
                'total_skus' => 0,
                'total_po_units' => 0,
                'good_units' => 0,
                'damaged_units' => 0,
                'progress_percentage' => 0,
            ],
            'items' => [],
        ];
    }

    public function verifyBarcode(string $tenant_slug, string $barcode): array
    {
        return [
            'success' => true,
            'message' => "Item dengan barcode {$barcode} tervalidasi!",
        ];
    }

    public function updatePutawayAllocation(string $tenant_slug, array $data): array
    {
        return [
            'success' => true,
            'message' => 'Alokasi rak & fisik berhasil diperbarui.',
        ];
    }

    public function commitInbound(string $tenant_slug): bool
    {
        return true;
    }

    public function holdInboundSession(string $tenant_slug, string $reason): bool
    {
        return true;
    }
}
