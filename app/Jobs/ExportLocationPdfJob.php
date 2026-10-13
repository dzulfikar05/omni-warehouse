<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\Location;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ExportLocationPdfJob implements ShouldQueue
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
            $query = Location::with('warehouse')->where('tenant_id', $log->tenant_id);

            if (!empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('rack_code', 'like', "%{$search}%")
                      ->orWhere('zone', 'like', "%{$search}%")
                      ->orWhere('desc', 'like', "%{$search}%");
                });
            }

            if (!empty($this->filters['warehouse_id']) && $this->filters['warehouse_id'] !== 'all') {
                $query->where('warehouse_id', $this->filters['warehouse_id']);
            }

            $locations = $query->latest()->get();

            $pdf = Pdf::loadView('exports.pdf.locations', [
                'locations' => $locations,
                'tenant'    => $log->tenant,
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
