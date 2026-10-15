<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ExportStockOpnamePdfJob implements ShouldQueue
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
            $pdf = Pdf::loadView('exports.pdf.stock_opname', [
                'session' => $this->dataPayload['session'] ?? [],
                'items'   => $this->dataPayload['items'] ?? [],
                'tenant'  => $log->tenant,
            ]);

            $filePath = 'exports/' . $log->filename;
            Storage::disk('public')->put($filePath, $pdf->output());

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
