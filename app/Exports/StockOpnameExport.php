<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StockOpnameExport implements FromArray, WithHeadings, WithMapping
{
    protected array $dataPayload;

    public function __construct(array $dataPayload)
    {
        $this->dataPayload = $dataPayload;
    }

    public function array(): array
    {
        return $this->dataPayload['items'] ?? [];
    }

    public function headings(): array
    {
        return [
            'SKU',
            'Barcode',
            'Nama Barang',
            'Batch',
            'Tgl Expired',
            'Kode Rak',
            'Stok Buku (Sistem)',
            'Fisik Lapangan',
            'Selisih (Variance)',
            'Satuan',
            'Status',
        ];
    }

    public function map($item): array
    {
        $item = (array) $item;

        return [
            $item['sku'] ?? '-',
            $item['barcode'] ?? '-',
            $item['name'] ?? '-',
            $item['batch'] ?? '-',
            $item['exp_date'] ?? '-',
            $item['rack'] ?? '-',
            $item['system_qty'] ?? 0,
            $item['physical_qty'] ?? 0,
            $item['variance'] ?? 0,
            $item['unit'] ?? 'PCS',
            $item['status'] ?? '-',
        ];
    }
}
