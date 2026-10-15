<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SkusExport implements FromCollection, WithHeadings
{
    public function __construct(protected array $skus) {}

    public function collection(): \Illuminate\Support\Collection
    {
        return collect($this->skus)->map(function ($item) {
            return [
                'SKU Code'       => $item['sku_code'],
                'Product Parent' => $item['product']['name'] ?? '-',
                'Current Stock'  => $item['current_stock'],
                'Unit Symbol'    => $item['unit']['symbol'] ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return ['SKU Code', 'Product Parent', 'Current Stock', 'Unit Symbol'];
    }
}
