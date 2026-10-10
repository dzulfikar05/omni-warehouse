<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\Supplier;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExportSupplierPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected int $exportLogId) {}

    public function handle(): void
    {
        $exportLog = ExportLog::find($this->exportLogId);
        if (!$exportLog) return;

        try {
            $exportLog->update(['status' => 'processing']);

            $tenant = Tenant::findOrFail($exportLog->tenant_id);

            $settings = DB::table('general_settings')
                ->where('tenant_id', $tenant->id)
                ->pluck('value', 'name')
                ->toArray();

            $suppliers = Supplier::where('tenant_id', $tenant->id)->get();

            $logoUrl = null;
            if (!empty($settings['doc_show_logo']) && $settings['doc_show_logo'] == '1') {
                $media = $tenant->getFirstMedia('logo');

                if ($media && file_exists($media->getPath())) {
                    $path = $media->getPath();
                    $type = pathinfo($path, PATHINFO_EXTENSION);
                    $data = file_get_contents($path);
                    $logoUrl = 'data:image/' . $type . ';base64,' . base64_encode($data);
                } elseif (!empty($tenant->logo)) {
                    $path = public_path('storage/' . ltrim($tenant->logo, '/'));
                    if (file_exists($path)) {
                        $type = pathinfo($path, PATHINFO_EXTENSION);
                        $data = file_get_contents($path);
                        $logoUrl = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    }
                }
            }

            $pdf = Pdf::loadView('pdf.suppliers_report', [
                'tenant'    => $tenant,
                'suppliers' => $suppliers,
                'settings'  => $settings,
                'logoUrl'   => $logoUrl,
            ])
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true)
            ->setPaper($settings['doc_paper_size'] ?? 'a4', 'portrait');

            $relativePath = 'exports/' . $exportLog->filename;
            Storage::disk('public')->put($relativePath, $pdf->output());

            $exportLog->update([
                'status'    => 'completed',
                'file_path' => Storage::url($relativePath),
            ]);
        } catch (\Throwable $e) {
            $exportLog->update(['status' => 'failed']);
            throw $e;
        }
    }
}
