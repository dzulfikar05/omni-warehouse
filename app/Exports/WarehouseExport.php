<?php

namespace App\Exports;

use App\Models\Tenant;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;

class WarehouseExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithCustomStartCell, WithEvents
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
        $query = Warehouse::query()->where('tenant_id', $this->tenantId);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('desc', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['is_active']) && $this->filters['is_active'] !== 'all') {
            $isActive = $this->filters['is_active'] === '1' || $this->filters['is_active'] === 'true';
            $query->where('is_active', $isActive);
        }

        return $query->latest('created_at');
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        return [
            'Kode Gudang',
            'Nama Warehouse',
            'Alamat / Deskripsi',
            'Status',
            'Tanggal Dibuat',
        ];
    }

    public function map(mixed $item): array
    {
        return [
            $item->code ?? '-',
            $item->name ?? '-',
            $item->desc ?? '-',
            $item->is_active ? 'Active' : 'Inactive',
            $item->created_at ? $item->created_at->format('Y-m-d H:i:s') : '-',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $headerText = !empty($this->settings['doc_header_html'])
                    ? trim(strip_tags($this->settings['doc_header_html']))
                    : ($this->tenant?->name ?? 'WAREHOUSE LIST REPORT');

                $sheet->setCellValue('A1', $headerText);
                $sheet->mergeCells('A1:E1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);

                if (!empty($this->settings['doc_show_npwp']) && $this->settings['doc_show_npwp'] == '1' && $this->tenant?->tax_number) {
                    $sheet->setCellValue('A2', 'NPWP / TAX ID: ' . $this->tenant->tax_number);
                    $sheet->mergeCells('A2:E2');
                    $sheet->getStyle('A2')->getFont()->setSize(9)->setItalic(true);
                }

                $sheet->setCellValue('A4', 'DAFTAR MASTER GUDANG (WAREHOUSES)');
                $sheet->mergeCells('A4:E4');
                $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);

                $sheet->getStyle('A6:E6')->getFont()->setBold(true);

                if (!empty($this->settings['doc_footer_html'])) {
                    $highestRow = $sheet->getHighestRow() + 2;
                    $footerText = trim(strip_tags($this->settings['doc_footer_html']));
                    $sheet->setCellValue('A' . $highestRow, $footerText);
                    $sheet->mergeCells('A' . $highestRow . ':E' . $highestRow);
                    $sheet->getStyle('A' . $highestRow)->getFont()->setSize(9)->setItalic(true);
                }
            },
        ];
    }
}
