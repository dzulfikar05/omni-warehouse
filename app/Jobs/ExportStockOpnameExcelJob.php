<?php

namespace App\Jobs;

use App\Exports\StockOpnameExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ExportStockOpnameExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $logId;
    protected array $dataPayload;

    public function __construct(int $logId, array $dataPayload)
    {
        $this->logId = $logId;
        $this->dataPayload = $dataPayload;
    }

    public function handle(): void
    {
        $log = ExportLog::find($this->logId);
        if (!$log) return;

        $log->update(['status' => 'processing']);

        try {
            $filePath = 'exports/' . $log->filename;
            Excel::store(new StockOpnameExport($this->dataPayload), $filePath, 'public');

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
