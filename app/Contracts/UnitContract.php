<?php

namespace App\Contracts;

use App\Models\Unit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UnitContract
{
    public function getPaginatedUnits(array $filters, int $perPage = 10): LengthAwarePaginator;

    public function getUnitStats(array $filters): array;

    public function createUnit(array $data): Unit;

    public function updateUnit(Unit $unit, array $data): Unit;

    public function deleteUnit(Unit $unit): bool;

    public function exportPdf(string $tenantSlug): void;

    public function exportExcel(string $tenantSlug): void;
}
