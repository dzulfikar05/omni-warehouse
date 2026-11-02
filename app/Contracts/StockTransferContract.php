<?php

namespace App\Contracts;

interface StockTransferContract
{
    public function getTransferLogsList(string $tenant_slug, array $filters = []): array;

    public function createStockTransfer(string $tenant_slug, array $data): array;
}
