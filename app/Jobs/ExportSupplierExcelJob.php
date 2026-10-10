<?php

namespace App\Jobs;

use App\Exports\SuppliersExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ExportSupplierExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected int $exportLogId) {}

    public function handle(): void
    {
        $exportLog = ExportLog::find($this->exportLogId);
        if (!$exportLog) return;

        try {
            $exportLog->update(['status' => 'processing']);

            $relativePath = 'exports/' . $exportLog->filename;

            Excel::store(
                new SuppliersExport($exportLog->tenant_id),
                $relativePath,
                'public'
            );

            $exportLog->update([
                'status'    => 'completed',
                'file_path' => Storage::url($relativePath),
            ]);
        } catch (\Throwable $e) {
            Log::error('Export Supplier Excel Failed: ' . $e->getMessage());
            $exportLog->update(['status' => 'failed']);
            throw $e;
        }
    }
}
