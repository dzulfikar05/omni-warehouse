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

class StockSummaryExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithCustomStartCell, WithEvents
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

        if (!empty($this->filters['status']) && $this->filters['status'] !== 'all') {
            $status = $this->filters['status'];
            if ($status === 'out_of_stock') {
                $query->where('quantity', '<=', 0);
            } elseif ($status === 'low_stock') {
                $query->where('quantity', '>', 0)->where('quantity', '<=', 15);
            } elseif ($status === 'in_stock') {
                $query->where('quantity', '>', 15);
            }
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
            'Batch No',
            'Warehouse',
            'Rack / Zone',
            'Quantity',
            'Unit',
            'Base Cost (Rp)',
            'Total Value (Rp)',
            'Expiry Date',
            'Category',
            'Status',
        ];
    }

    public function map(mixed $stock): array
    {
        $qty = $stock->quantity ?? 0;
        $cost = $stock->sku?->base_cost ?? 0;
        $totalVal = $qty * $cost;

        $statusText = 'In Stock';
        if ($qty <= 0) {
            $statusText = 'Out of Stock';
        } elseif ($qty <= 15) {
            $statusText = 'Low Stock';
        }

        $loc = $stock->location;
        $rackZone = '-';
        if ($loc) {
            $rackZone = trim(($loc->rack_code ?? '') . ' / ' . ($loc->zone ?? ''), ' /');
            if (empty($rackZone)) $rackZone = '-';
        }

        return [
            $stock->sku?->sku_code ?? '-',
            $stock->sku?->product?->name ?? '-',
            $stock->batch_number ?? '-',
            $stock->location?->warehouse?->name ?? '-',
            $rackZone,
            $qty,
            $stock->sku?->unit?->symbol ?? '-',
            $cost,
            $totalVal,
            $stock->expiry_date ? date('Y-m-d', strtotime($stock->expiry_date)) : '-',
            $stock->sku?->product?->category?->name ?? '-',
            $statusText,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $headerText = !empty($this->settings['doc_header_html'])
                    ? trim(strip_tags($this->settings['doc_header_html']))
                    : ($this->tenant?->name ?? 'STOCK SUMMARY REPORT');

                $sheet->setCellValue('A1', $headerText);
                $sheet->mergeCells('A1:L1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);

                if (!empty($this->settings['doc_show_npwp']) && $this->settings['doc_show_npwp'] == '1' && $this->tenant?->tax_number) {
                    $sheet->setCellValue('A2', 'NPWP / TAX ID: ' . $this->tenant->tax_number);
                    $sheet->mergeCells('A2:L2');
                    $sheet->getStyle('A2')->getFont()->setSize(9)->setItalic(true);
                }

                $sheet->setCellValue('A4', 'LAPORAN RINGKASAN STOK (STOCK SUMMARY)');
                $sheet->mergeCells('A4:L4');
                $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);

                $sheet->getStyle('A6:L6')->getFont()->setBold(true);

                if (!empty($this->settings['doc_footer_html'])) {
                    $highestRow = $sheet->getHighestRow() + 2;
                    $footerText = trim(strip_tags($this->settings['doc_footer_html']));
                    $sheet->setCellValue('A' . $highestRow, $footerText);
                    $sheet->mergeCells('A' . $highestRow . ':L' . $highestRow);
                    $sheet->getStyle('A' . $highestRow)->getFont()->setSize(9)->setItalic(true);
                }
            },
        ];
    }
}
