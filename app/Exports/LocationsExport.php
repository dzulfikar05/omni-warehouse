<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class LocationsExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $tenantId;
    protected array $filters;

    public function __construct(int $tenantId, array $filters = [])
    {
        $this->tenantId = $tenantId;
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Location::with('warehouse')->where('tenant_id', $this->tenantId);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('rack_code', 'like', "%{$search}%")
                  ->orWhere('zone', 'like', "%{$search}%");
            });
        }

        if (!empty($this->filters['warehouse_id']) && $this->filters['warehouse_id'] !== 'all') {
            $query->where('warehouse_id', $this->filters['warehouse_id']);
        }

        return $query->latest()->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Gudang',
            'Kode Rak',
            'Zona',
            'Deskripsi',
            'Status Aktif',
            'Tanggal Dibuat',
        ];
    }

    public function map($location): array
    {
        return [
            $location->id,
            $location->warehouse->name ?? '-',
            $location->rack_code,
            $location->zone ?? '-',
            $location->desc ?? '-',
            $location->is_active ? 'Active' : 'Inactive',
            $location->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
