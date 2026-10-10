<?php

namespace App\Jobs;

use App\Exports\StockMovementExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ExportStockMovementExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $exportLogId,
        protected array $filters = []
    ) {}

    public function handle(): void
    {
        $exportLog = ExportLog::find($this->exportLogId);
        if (!$exportLog) return;

        try {
            $exportLog->update(['status' => 'processing']);

            $relativePath = 'exports/' . $exportLog->filename;

            Excel::store(
                new StockMovementExport($exportLog->tenant_id, $this->filters),
                $relativePath,
                'public'
            );

            $exportLog->update([
                'status'    => 'completed',
                'file_path' => Storage::url($relativePath),
            ]);
        } catch (\Throwable $e) {
            Log::error('Export Stock Movement Excel Failed: ' . $e->getMessage());
            $exportLog->update(['status' => 'failed']);
            throw $e;
        }
    }
}
