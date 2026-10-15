<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class CategoriesExport implements FromCollection, WithHeadings
{
    public function __construct(protected array $categories) {}

    public function collection(): Collection
    {
        return collect($this->categories)->map(function ($item) {
            return [
                'Category ID'    => 'CAT-00' . $item['id'],
                'Category Name'  => $item['name'],
                'Description'    => $item['desc'] ?? '-',
                'Products Count' => $item['products_count'] ?? 0,
            ];
        });
    }

    public function headings(): array
    {
        return ['Category ID', 'Category Name', 'Description', 'Products Count'];
    }
}
