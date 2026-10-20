<?php

namespace App\Exports;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TenantsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(protected Request $request) {}

    public function query(): \Illuminate\Database\Eloquent\Builder
    {
        $query = Tenant::with(['subscription.plan']);

        if ($this->request->filled('search')) {
            $search = $this->request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('slug', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%");
            });
        }

        if ($this->request->filled('plan_id') && $this->request->plan_id !== 'all') {
            $query->whereHas('subscription', function ($q) {
                $q->where('plan_id', $this->request->plan_id);
            });
        }

        if ($this->request->filled('status') && $this->request->status !== 'all') {
            $query->whereHas('subscription', function ($q) {
                $q->where('status', $this->request->status);
            });
        }

        return $query->orderBy(
            $this->request->input('sort_by', 'created_at'),
            $this->request->input('sort_order', 'desc')
        );
    }

    public function headings(): array
    {
        return [
            'ID',
            'Company Name',
            'Slug',
            'Email',
            'Phone',
            'Website',
            'Tax Number',
            'Plan Tier',
            'Subscription Status',
            'Created At',
        ];
    }

    public function map($tenant): array
    {
        return [
            $tenant->id,
            $tenant->name,
            $tenant->slug,
            $tenant->email ?? '-',
            $tenant->phone ?? '-',
            $tenant->website ?? '-',
            $tenant->tax_number ?? '-',
            $tenant->subscription?->plan?->name ?? 'Standard Plan',
            strtoupper($tenant->subscription?->status ?? 'INACTIVE'),
            $tenant->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
