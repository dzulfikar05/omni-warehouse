<?php

namespace App\Contracts;

interface StockOpnameContract
{
    public function getActiveSessionData(string $tenantSlug): array;

    public function createSession(string $tenantSlug, array $data): bool;

    public function updateItemPhysicalQty(string $tenantSlug, array $data): bool;

    public function executeAdjustment(string $tenantSlug, int $sessionId): bool;
}
