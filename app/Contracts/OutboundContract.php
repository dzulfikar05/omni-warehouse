<?php

namespace App\Contracts;

interface OutboundContract
{
    public function getOutboundManifestsList(string $tenant_slug): array;

    public function getManifestDetail(string $tenant_slug, string $manifest_code): array;

    public function verifyBarcode(string $tenant_slug, string $barcode): array;

    public function updatePackingAllocation(string $tenant_slug, array $data): array;

    public function commitOutbound(string $tenant_slug): bool;

    public function holdOutboundSession(string $tenant_slug, string $reason): bool;
}
