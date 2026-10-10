<?php

namespace App\Exports;

use App\Models\Supplier;
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

class SuppliersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithCustomStartCell, WithEvents
{
    protected ?Tenant $tenant = null;
    protected array $settings = [];

    public function __construct(protected int $tenantId)
    {
        $this->tenant = Tenant::find($this->tenantId);
        $this->settings = DB::table('general_settings')
            ->where('tenant_id', $this->tenantId)
            ->pluck('value', 'name')
            ->toArray();
    }

    public function query(): Builder
    {
        return Supplier::query()->where('tenant_id', $this->tenantId);
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Supplier',
            'PIC',
            'Telepon',
            'Email',
            'NPWP / Tax ID',
            'Alamat',
            'Tanggal Dibuat',
        ];
    }

    public function map(mixed $supplier): array
    {
        return [
            $supplier->id,
            $supplier->name,
            $supplier->pic ?? '-',
            $supplier->phone ?? '-',
            $supplier->email ?? '-',
            $supplier->tax_number ?? '-',
            $supplier->address ?? '-',
            $supplier->created_at?->format('Y-m-d H:i:s') ?? '-',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $headerText = !empty($this->settings['doc_header_html'])
                    ? trim(strip_tags($this->settings['doc_header_html']))
                    : ($this->tenant?->name ?? 'LAPORAN SUPPLIER');

                $sheet->setCellValue('A1', $headerText);
                $sheet->mergeCells('A1:H1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);

                if (!empty($this->settings['doc_show_npwp']) && $this->settings['doc_show_npwp'] == '1' && $this->tenant?->tax_number) {
                    $sheet->setCellValue('A2', 'NPWP / TAX ID: ' . $this->tenant->tax_number);
                    $sheet->mergeCells('A2:H2');
                    $sheet->getStyle('A2')->getFont()->setSize(9)->setItalic(true);
                }

                $sheet->setCellValue('A4', 'LAPORAN DATA SUPPLIER');
                $sheet->mergeCells('A4:H4');
                $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);

                $sheet->getStyle('A6:H6')->getFont()->setBold(true);

                if (!empty($this->settings['doc_footer_html'])) {
                    $highestRow = $sheet->getHighestRow() + 2;
                    $footerText = trim(strip_tags($this->settings['doc_footer_html']));
                    $sheet->setCellValue('A' . $highestRow, $footerText);
                    $sheet->mergeCells('A' . $highestRow . ':H' . $highestRow);
                    $sheet->getStyle('A' . $highestRow)->getFont()->setSize(9)->setItalic(true);
                }
            },
        ];
    }
}
