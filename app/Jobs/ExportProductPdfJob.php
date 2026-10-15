<?php

namespace App\Jobs;

use App\Models\ExportLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ExportProductPdfJob implements ShouldQueue
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
            $pdf = Pdf::loadView('exports.pdf.products', [
                'products' => $this->products,
                'generatedAt' => now()->format('d M Y H:i'),
            ])->setPaper('a4', 'landscape');

            $filePath = 'exports/products/' . $log->filename;
            Storage::disk('public')->put($filePath, $pdf->output());

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
