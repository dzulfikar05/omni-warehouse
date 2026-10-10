<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\InventoryStock;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExportValuationAssetPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected int $exportLogId,
        protected array $filters = []
    ) {}

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

            $query = InventoryStock::whereHas('sku.product', function ($q) use ($tenant) {
                $q->where('tenant_id', $tenant->id);
            })->with(['sku.product.category', 'sku.unit', 'location.warehouse']);

            if (!empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('batch_number', 'like', "%{$search}%")
                      ->orWhereHas('sku', function ($sq) use ($search) {
                          $sq->where('sku_code', 'like', "%{$search}%")
                            ->orWhere('barcode', 'like', "%{$search}%")
                            ->orWhereHas('product', function ($pq) use ($search) {
                                $pq->where('name', 'like', "%{$search}%");
                            });
                      });
                });
            }

            if (!empty($this->filters['warehouse_id']) && $this->filters['warehouse_id'] !== 'all') {
                $warehouseId = $this->filters['warehouse_id'];
                $query->whereHas('location', function ($q) use ($warehouseId) {
                    $q->where('warehouse_id', $warehouseId);
                });
            }

            if (!empty($this->filters['category_id']) && $this->filters['category_id'] !== 'all') {
                $categoryId = $this->filters['category_id'];
                $query->whereHas('sku.product', function ($q) use ($categoryId) {
                    $q->where('category_id', $categoryId);
                });
            }

            if (!empty($this->filters['date_from'])) {
                $query->whereDate('updated_at', '>=', $this->filters['date_from']);
            }

            if (!empty($this->filters['date_to'])) {
                $query->whereDate('updated_at', '<=', $this->filters['date_to']);
            }

            $items = $query->latest('updated_at')->get();

            $logoUrl = null;
            if (!empty($settings['doc_show_logo']) && $settings['doc_show_logo'] == '1') {
                $media = $tenant->getFirstMedia('logo');
                if ($media && file_exists($media->getPath())) {
                    $path = $media->getPath();
                    $type = pathinfo($path, PATHINFO_EXTENSION);
                    $data = file_get_contents($path);
                    $logoUrl = 'data:image/' . $type . ';base64,' . base64_encode($data);
                }
            }

            $pdf = Pdf::loadView('pdf.valuation_asset_report', [
                'tenant'   => $tenant,
                'items'    => $items,
                'settings' => $settings,
                'logoUrl'  => $logoUrl,
            ])
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true)
            ->setPaper($settings['doc_paper_size'] ?? 'a4', 'landscape');

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
