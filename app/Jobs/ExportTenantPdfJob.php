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

class ExportTenantPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected int $exportLogId) {}

    public function handle(): void
    {
        $log = ExportLog::find($this->exportLogId);
        if (!$log) return;

        try {
            $tenants = Tenant::with('subscription.plan')->get();

            $pdf = Pdf::loadView('pdf.tenants_report', ['tenants' => $tenants]);

            $filePath = 'exports/' . $log->filename;
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
