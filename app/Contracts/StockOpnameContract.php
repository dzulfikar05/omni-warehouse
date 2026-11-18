<?php

namespace App\Contracts;

interface StockOpnameContract
{
    public function getActiveSessionData(string $tenantSlug, bool $isForMobile = false, int|string|null $sessionId = null): array;

    public function getSessionData(string $tenantSlug, int $sessionId): array;

    public function createSession(string $tenantSlug, array $data, ?int $userId = null): array;

    public function updateItemPhysicalQty(string $tenantSlug, array $data, ?int $userId = null): array;

    public function syncScannedSkuToSession(string $tenantSlug, int $sessionId, string $barcode, ?int $userId = null): int;

    public function syncOfflineOpname(string $tenantSlug, array $payload, int $userId): array;

    public function submitSessionForReview(string $tenantSlug, int|string $sessionIdentifier): bool;

    public function executeAdjustment(string $tenantSlug, int $sessionId, ?int $userId = null): bool;
}
