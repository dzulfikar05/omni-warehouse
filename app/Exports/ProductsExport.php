<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProductsExport implements FromCollection, WithHeadings
{
    public function __construct(protected array $products) {}

    public function collection(): Collection
    {
        return collect($this->products)->map(function ($item) {
            return [
                'Product ID'   => 'PRD-00' . $item['id'],
                'Product Name' => $item['name'],
                'Category'     => $item['category']['name'] ?? '-',
                'Status'       => strtoupper($item['status'] ?? 'ACTIVE'),
                'Description'  => $item['description'] ?? '-',
                'SKU Count'    => count($item['skus'] ?? []),
            ];
        });
    }

    public function headings(): array
    {
        return ['Product ID', 'Product Name', 'Category', 'Status', 'Description', 'SKU Count'];
    }
}
