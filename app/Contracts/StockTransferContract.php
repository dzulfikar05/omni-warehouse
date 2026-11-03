<?php

namespace App\Contracts;

interface StockTransferContract
{
    public function getTransferLogsList(string $tenant_slug, array $filters = []): array;

    public function createStockTransfer(string $tenant_slug, array $data, ?int $userId = null): array;

    public function updateStockTransfer(string $tenant_slug, string $transfer_code, array $data): bool;

    public function cancelStockTransfer(string $tenant_slug, string $transfer_code, ?int $userId = null): bool;
}
