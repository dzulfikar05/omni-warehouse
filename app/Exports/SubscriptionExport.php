<?php

namespace App\Exports;

use App\Models\Subscription;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class SubscriptionExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        $query = Subscription::with(['tenant', 'plan']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->whereHas('tenant', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['plan_id'])) {
            $query->where('plan_id', $this->filters['plan_id']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'ID Subscriptions',
            'Tenant Name',
            'Tenant Slug',
            'Plan Tier',
            'Price (IDR)',
            'Status',
            'Expiration Date',
            'Created At',
        ];
    }

    public function map($subscription): array
    {
        return [
            $subscription->id,
            $subscription->tenant?->name ?? 'N/A',
            $subscription->tenant?->slug ?? '-',
            $subscription->plan?->name ?? 'N/A',
            $subscription->plan?->price ?? 0,
            strtoupper($subscription->status),
            $subscription->ends_at ? date('Y-m-d', strtotime($subscription->ends_at)) : 'Lifetime / Auto-renew',
            $subscription->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
