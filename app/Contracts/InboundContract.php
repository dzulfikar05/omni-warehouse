<?php

namespace App\Contracts;

interface InboundContract
{
    public function getInboundManifestsList(string $tenant_slug, array $filters = []): array;

    public function createManifest(string $tenant_slug, array $data, int $userId): array;

    public function createManifestFromPo(string $tenant_slug, array $data, int $userId): array;

    public function getManifestDetail(string $tenant_slug, string $manifest_code): array;

    public function verifyBarcode(string $tenant_slug, string $manifest_code, string $barcode): array;

    public function updatePutawayAllocation(string $tenant_slug, array $data): array;

    public function commitInbound(string $tenant_slug, string $manifest_code): bool;

    public function holdInboundSession(string $tenant_slug, string $manifest_code, string $reason): bool;

    public function resumeInboundSession(string $tenant_slug, string $manifest_code): bool;

    public function holdInbound(string $tenant_slug, string $manifest_code, ?string $reason = null): bool;

    public function resumeInbound(string $tenant_slug, string $manifest_code): bool;
}
