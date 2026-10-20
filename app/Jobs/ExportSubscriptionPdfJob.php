<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\Subscription;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ExportSubscriptionPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $exportLogId;
    protected array $filters;

    public function __construct(int $exportLogId, array $filters = [])
    {
        $this->exportLogId = $exportLogId;
        $this->filters = $filters;
    }

    public function handle(): void
    {
        $log = ExportLog::find($this->exportLogId);
        if (!$log) return;

        try {
            $log->update(['status' => 'processing']);

            $query = Subscription::with(['tenant', 'plan']);

            // 1. Filter Search (Tenant Name / Slug)
            if (!empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->whereHas('tenant', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            // 2. Filter Status
            if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
                $query->where('status', $this->filters['status']);
            }

            // 3. Filter Plan Tier
            if (!empty($this->filters['plan_id'])) {
                $query->where('plan_id', $this->filters['plan_id']);
            }

            // 4. Filter Date Range
            if (!empty($this->filters['date_from'])) {
                $query->whereDate('created_at', '>=', $this->filters['date_from']);
            }
            if (!empty($this->filters['date_to'])) {
                $query->whereDate('created_at', '<=', $this->filters['date_to']);
            }

            $subscriptions = $query->latest()->get();

            $pdf = Pdf::loadView('exports.subscriptions_pdf', compact('subscriptions'))
                ->setPaper('a4', 'landscape');

            $fileName = 'exports/subscriptions/' . $log->filename;
            Storage::disk('public')->put($fileName, $pdf->output());

            $log->update([
                'status' => 'completed',
                'file_path' => Storage::url($fileName),
            ]);
        } catch (Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
