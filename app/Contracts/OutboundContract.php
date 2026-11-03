<?php

namespace App\Contracts;

interface OutboundContract
{
    public function getOutboundManifestsList(string $tenantSlug, array$filters = []): array;
    public function createManifest(string $tenantSlug, array $data, int$userId): array;
    public function getManifestDetail(string $tenantSlug, string$manifestCode): array;
    public function verifyBarcode(string $tenantSlug, string $manifestCode, string$barcode): array;
    public function updatePickingAllocation(string $tenantSlug, array$data): array;
    public function commitOutbound(string $tenantSlug, string$manifestCode): array;
    public function holdOutboundSession(string $tenantSlug, string $manifestCode, string$reason): array;
    public function resumeOutboundSession(string $tenantSlug, string$manifestCode): array;
}
