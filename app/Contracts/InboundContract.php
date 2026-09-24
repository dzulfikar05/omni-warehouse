<?php

namespace App\Contracts;

interface InboundContract
{
    public function getInboundManifestsList(string $tenant_slug): array;

    public function getManifestDetail(string $tenant_slug, string $manifest_code): array;

    public function verifyBarcode(string $tenant_slug, string $barcode): array;

    public function updatePutawayAllocation(string $tenant_slug, array $data): array;

    public function commitInbound(string $tenant_slug): bool;

    public function holdInboundSession(string $tenant_slug, string $reason): bool;
}
