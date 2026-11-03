<?php

namespace App\Jobs;

use App\Exports\CategoriesExport;
use App\Models\ExportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;


class ExportCategoryExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $exportLogId,
        protected array $categories
    ) {}

    public function handle(): void
    {
        $log = ExportLog::find($this->exportLogId);
        if (! $log) return;

        try {
            $filePath = 'exports/categories/' . $log->filename;
            Excel::store(new CategoriesExport($this->categories), $filePath, 'public');

            $log->update([
                'status'    => 'completed',
                'file_path' => Storage::url($filePath),
            ]);
        } catch (\Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error_message'  => $e->getMessage(),
            ]);
        }
    }
}
