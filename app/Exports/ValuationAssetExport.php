<?php

namespace App\Exports;

use App\Models\InventoryStock;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;

class ValuationAssetExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithCustomStartCell, WithEvents
{
    protected ?Tenant $tenant = null;
    protected array $settings = [];

    public function __construct(
        protected int $tenantId,
        protected array $filters = []
    ) {
        $this->tenant = Tenant::find($this->tenantId);
        $this->settings = DB::table('general_settings')
            ->where('tenant_id', $this->tenantId)
            ->pluck('value', 'name')
            ->toArray();
    }

    public function query(): Builder
    {
        $query = InventoryStock::query()
            ->whereHas('sku.product', function ($q) {
                $q->where('tenant_id', $this->tenantId);
            })
            ->with(['sku.product.category', 'sku.unit', 'location.warehouse']);

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

        return $query->latest('updated_at');
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        return [
            'SKU Code',
            'Product Name',
            'Category',
            'Warehouse',
            'Rack / Zone',
            'Batch Number',
            'Qty On Hand',
            'Unit',
            'Base Cost / Unit (Rp)',
            'Total Valuation Asset (Rp)',
            'Expiry Date',
        ];
    }

    public function map(mixed $item): array
    {
        $cost = (float) ($item->sku?->base_cost ?? 0);
        $qty = (float) ($item->quantity ?? 0);
        $totalValuation = $qty * $cost;

        $loc = $item->location;
        $rackZone = '-';
        if ($loc) {
            $rackZone = trim(($loc->rack_code ?? '') . ' / ' . ($loc->zone ?? ''), ' /');
            if (empty($rackZone)) $rackZone = '-';
        }

        return [
            $item->sku?->sku_code ?? '-',
            $item->sku?->product?->name ?? '-',
            $item->sku?->product?->category?->name ?? '-',
            $item->location?->warehouse?->name ?? '-',
            $rackZone,
            $item->batch_number ?? '-',
            $qty,
            $item->sku?->unit?->symbol ?? '-',
            $cost,
            $totalValuation,
            $item->expiry_date ? date('Y-m-d', strtotime($item->expiry_date)) : '-',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $headerText = !empty($this->settings['doc_header_html'])
                    ? trim(strip_tags($this->settings['doc_header_html']))
                    : ($this->tenant?->name ?? 'VALUATION ASSET REPORT');

                $sheet->setCellValue('A1', $headerText);
                $sheet->mergeCells('A1:K1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);

                if (!empty($this->settings['doc_show_npwp']) && $this->settings['doc_show_npwp'] == '1' && $this->tenant?->tax_number) {
                    $sheet->setCellValue('A2', 'NPWP / TAX ID: ' . $this->tenant->tax_number);
                    $sheet->mergeCells('A2:K2');
                    $sheet->getStyle('A2')->getFont()->setSize(9)->setItalic(true);
                }

                $sheet->setCellValue('A4', 'LAPORAN PENILAIAN ASET STOK (VALUATION ASSET)');
                $sheet->mergeCells('A4:K4');
                $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);

                $sheet->getStyle('A6:K6')->getFont()->setBold(true);

                if (!empty($this->settings['doc_footer_html'])) {
                    $highestRow = $sheet->getHighestRow() + 2;
                    $footerText = trim(strip_tags($this->settings['doc_footer_html']));
                    $sheet->setCellValue('A' . $highestRow, $footerText);
                    $sheet->mergeCells('A' . $highestRow . ':K' . $highestRow);
                    $sheet->getStyle('A' . $highestRow)->getFont()->setSize(9)->setItalic(true);
                }
            },
        ];
    }
}
