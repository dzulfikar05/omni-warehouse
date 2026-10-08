<?php

namespace App\Exports;

use App\Models\Customer;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;

class CustomersExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithCustomStartCell, WithEvents
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
        return Customer::query()->where('tenant_id', $this->tenantId);
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Customer',
            'Telepon',
            'Email',
            'NPWP / Tax ID',
            'Alamat',
            'Tanggal Dibuat',
        ];
    }

    public function map(mixed $customer): array
    {
        return [
            $customer->id,
            $customer->name,
            $customer->phone ?? '-',
            $customer->email ?? '-',
            $customer->tax_number ?? '-',
            $customer->address ?? '-',
            $customer->created_at?->format('Y-m-d H:i:s') ?? '-',
        ];
    }

    // Event untuk menyisipkan Kop Surat HTML/Text di bagian atas Excel
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // 1. Teks Kop Surat Header
                $headerText = !empty($this->settings['doc_header_html'])
                    ? trim(strip_tags($this->settings['doc_header_html']))
                    : ($this->tenant?->name ?? 'LAPORAN CUSTOMER');

                $sheet->setCellValue('A1', $headerText);
                $sheet->mergeCells('A1:G1');
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);

                // 2. NPWP / Tax ID
                if (!empty($this->settings['doc_show_npwp']) && $this->settings['doc_show_npwp'] == '1' && $this->tenant?->tax_number) {
                    $sheet->setCellValue('A2', 'NPWP / TAX ID: ' . $this->tenant->tax_number);
                    $sheet->mergeCells('A2:G2');
                    $sheet->getStyle('A2')->getFont()->setSize(9)->setItalic(true);
                }

                // 3. Judul Laporan
                $sheet->setCellValue('A4', 'LAPORAN DATA CUSTOMER');
                $sheet->mergeCells('A4:G4');
                $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(11);

                // 4. Style Header Tabel (Baris A6:G6)
                $sheet->getStyle('A6:G6')->getFont()->setBold(true);

                // 5. Footer Catatan
                if (!empty($this->settings['doc_footer_html'])) {
                    $highestRow = $sheet->getHighestRow() + 2;
                    $footerText = trim(strip_tags($this->settings['doc_footer_html']));
                    $sheet->setCellValue('A' . $highestRow, $footerText);
                    $sheet->mergeCells('A' . $highestRow . ':G' . $highestRow);
                    $sheet->getStyle('A' . $highestRow)->getFont()->setSize(9)->setItalic(true);
                }
            },
        ];
    }
}
