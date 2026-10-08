<?php

namespace App\Jobs;

use App\Exports\CustomersExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ExportCustomerExcelJob implements ShouldQueue
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

            // Generate dan simpan file Excel ke disk public
            Excel::store(
                new CustomersExport($exportLog->tenant_id),
                $relativePath,
                'public'
            );

            $exportLog->update([
                'status'    => 'completed',
                'file_path' => Storage::url($relativePath),
            ]);
        } catch (\Throwable $e) {
            // Catat error di storage/logs/laravel.log
            Log::error('Export Excel Failed: ' . $e->getMessage(), [
                'export_log_id' => $this->exportLogId,
                'trace'         => $e->getTraceAsString(),
            ]);

            // Ubah status ke failed agar notifikasi di frontend berhenti spin/loading
            $exportLog->update(['status' => 'failed']);

            throw $e;
        }
    }
}
