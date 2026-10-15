<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SkuExport implements FromArray, WithHeadings, WithMapping
{
    protected array $skus;

    public function __construct(array $skus)
    {
        $this->skus = $skus;
    }

    public function array(): array
    {
        return $this->skus;
    }

    public function headings(): array
    {
        return [
            'SKU Code',
            'Barcode',
            'Product Name',
            'Category',
            'Unit',
            'Base Cost (IDR)',
            'Current Stock',
            'Min Stock',
            'Date Created',
        ];
    }

    public function map($sku): array
    {
        $sku = (array) $sku;

        return [
            $sku['sku_code'] ?? '-',
            $sku['barcode'] ?? '-',
            $sku['product']['name'] ?? '-',
            $sku['product']['category']['name'] ?? '-',
            $sku['unit']['name'] ?? ($sku['unit']['symbol'] ?? '-'),
            $sku['base_cost'] ?? 0,
            $sku['current_stock'] ?? 0,
            $sku['min_stock'] ?? 0,
            isset($sku['created_at']) ? date('Y-m-d', strtotime($sku['created_at'])) : '-',
        ];
    }
}
