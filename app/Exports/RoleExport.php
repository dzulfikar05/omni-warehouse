<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Spatie\Permission\Models\Role;

class RoleExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Role::query()->whereNull('tenant_id')->with('permissions');

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'Role ID',
            'Role Name',
            'Guard',
            'Total Permissions',
            'Attached Permissions',
            'Created At',
        ];
    }

    public function map($role): array
    {
        return [
            $role->id,
            $role->name,
            $role->guard_name,
            $role->permissions->count(),
            $role->permissions->pluck('name')->implode(', '),
            $role->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
