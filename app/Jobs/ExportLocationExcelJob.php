<?php

namespace App\Jobs;

use App\Exports\LocationsExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ExportLocationExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $logId;
    protected array $filters;

    public function __construct(int $logId, array $filters = [])
    {
        $this->logId = $logId;
        $this->filters = $filters;
    }


    public function handle(): void
    {
        $log = ExportLog::find($this->logId);
        if (!$log) return;

        $log->update(['status' => 'processing']);

        try {
            $filePath = 'exports/' . $log->filename;
            Excel::store(new LocationsExport($log->tenant_id, $this->filters), $filePath, 'public');

            $log->update([
                'status'    => 'completed',
                'file_path' => $filePath,
            ]);
        } catch (\Exception $e) {
            $log->update([
                'status' => 'failed',
                'error'  => $e->getMessage(),
            ]);
        }
    }
}
