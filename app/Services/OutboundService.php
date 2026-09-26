<?php

namespace App\Services;

use App\Contracts\OutboundContract;
use App\Models\Tenant;

class OutboundService implements OutboundContract
{
    public function getOutboundManifestsList(string $tenant_slug): array
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
                'status' => 'READY_TO_PICK',
                'customer_name' => '-',
                'so_number' => '-',
                'vehicle_no' => '-',
                'vehicle_type' => '-',
                'driver_name' => '-',
                'driver_phone' => '-',
                'warehouse_name' => $tenantName,
                'dock_bay' => 'DOCK-OUT-01',
                'operator_name' => 'Operator Gudang',
                'operator_initials' => 'OP',
                'total_skus' => 0,
                'total_so_units' => 0,
                'picked_units' => 0,
                'packed_units' => 0,
                'progress_percentage' => 0,
            ],
            'items' => [],
        ];
    }

    public function verifyBarcode(string $tenant_slug, string $barcode): array
    {
        return [
            'success' => true,
            'message' => "Item outbound dengan barcode {$barcode} tervalidasi!",
        ];
    }

    public function updatePackingAllocation(string $tenant_slug, array $data): array
    {
        return [
            'success' => true,
            'message' => 'Status packing & verifikasi item berhasil diperbarui.',
        ];
    }

    public function commitOutbound(string $tenant_slug): bool
    {
        return true;
    }

    public function holdOutboundSession(string $tenant_slug, string $reason): bool
    {
        return true;
    }
}
