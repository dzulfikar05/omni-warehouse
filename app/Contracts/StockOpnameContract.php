<?php

namespace App\Contracts;

interface StockOpnameContract
{
    public function getActiveSessionData(string $tenantSlug, bool $isForMobile = false): array;

    public function createSession(string $tenantSlug, array $data, ?int $userId = null): array;

    public function updateItemPhysicalQty(string $tenantSlug, array $data, ?int $userId = null): array;

    public function syncOfflineOpname(string $tenantSlug, array $payload, int $userId): array;

    public function submitSessionForReview(string $tenantSlug, int|string $sessionIdentifier): bool;

    public function executeAdjustment(string $tenantSlug, int $sessionId, ?int $userId = null): bool;
}
