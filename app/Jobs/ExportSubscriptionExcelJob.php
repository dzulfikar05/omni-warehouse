<?php

namespace App\Jobs;

use App\Exports\SubscriptionExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class ExportSubscriptionExcelJob implements ShouldQueue
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

            $fileName = 'exports/subscriptions/' . $log->filename;

            // File ekspor dibuat berdasarkan kriteria filter
            Excel::store(new SubscriptionExport($this->filters), $fileName, 'public');

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
