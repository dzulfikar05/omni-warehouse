<?php

namespace App\Jobs;

use App\Exports\ProductsExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ExportProductExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $exportLogId,
        protected array $products
    ) {}

    public function handle(): void
    {
        $log = ExportLog::find($this->exportLogId);
        if (! $log) return;

        try {
            $filePath = 'exports/products/' . $log->filename;
            Excel::store(new ProductsExport($this->products), $filePath, 'public');

            $log->update([
                'status'    => 'completed',
                'file_path' => $filePath,
            ]);
        } catch (\Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error'  => $e->getMessage(),
            ]);
        }
    }
}
