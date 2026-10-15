<?php

namespace App\Services;

use App\Contracts\UnitContract;
use App\Jobs\ExportUnitExcelJob;
use App\Jobs\ExportUnitPdfJob;
use App\Models\ExportLog;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UnitService implements UnitContract
{
    public function getPaginatedUnits(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return Unit::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%")
                        ->orWhere('symbol', 'like', "%{$search}%");
                });
            })
            ->when($filters['sort_by'] ?? 'latest', function ($query, $sortBy) {
                match ($sortBy) {
                    'oldest'    => $query->oldest(),
                    'name_asc'  => $query->orderBy('name', 'asc'),
                    'name_desc' => $query->orderBy('name', 'desc'),
                    default     => $query->latest(),
                };
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getUnitStats(array $filters): array
    {
        $baseQuery = Unit::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('symbol', 'like', "%{$search}%");
                });
            });

        return [
            'total_units'    => (clone $baseQuery)->count(),
            'short_symbols'  => (clone $baseQuery)->whereRaw('CHAR_LENGTH(symbol) <= 3')->count(),
            'custom_symbols' => (clone $baseQuery)->whereRaw('CHAR_LENGTH(symbol) > 3')->count(),
        ];
    }

    public function createUnit(array $data): Unit
    {
        $tenant = app('current_tenant');

        return Unit::create([
            'tenant_id'  => $tenant?->id,
            'name'       => $data['name'],
            'symbol'     => $data['symbol'],
            'created_by' => auth()->id(),
        ]);
    }

    public function updateUnit(Unit $unit, array $data): Unit
    {
        $unit->update([
            'name'   => $data['name'],
            'symbol' => $data['symbol'],
        ]);

        return $unit;
    }

    public function deleteUnit(Unit $unit): bool
    {
        return $unit->delete();
    }

    public function exportPdf(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $units = Unit::all()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Unit_Master_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportUnitPdfJob::dispatch($log->id, $units);
    }

    public function exportExcel(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $units = Unit::all()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Unit_Master_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportUnitExcelJob::dispatch($log->id, $units);
    }
}
