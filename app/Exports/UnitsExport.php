<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UnitsExport implements FromCollection, WithHeadings
{
    public function __construct(protected array $units) {}


    public function collection(): \Illuminate\Support\Collection
    {
        return collect($this->units)->map(function ($item) {
            return [
                'Unit ID'   => 'UNIT-00' . $item['id'],
                'Unit Name' => $item['name'],
                'Symbol'    => $item['symbol'],
            ];
        });
    }

    public function headings(): array
    {
        return ['Unit ID', 'Unit Name', 'Symbol'];
    }
}
