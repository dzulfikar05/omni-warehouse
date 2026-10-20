<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportTenantExcelJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected int $exportLogId) {}

    public function handle(): void
    {
        $log = ExportLog::find($this->exportLogId);
        if (!$log) return;

        try {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            $sheet->setCellValue('A1', 'ID');
            $sheet->setCellValue('B1', 'Company Name');
            $sheet->setCellValue('C1', 'Slug');
            $sheet->setCellValue('D1', 'Email');
            $sheet->setCellValue('E1', 'Phone');
            $sheet->setCellValue('F1', 'Tax Number');
            $sheet->setCellValue('G1', 'Created At');

            $tenants = Tenant::all();
            $row = 2;

            foreach ($tenants as $tenant) {
                $sheet->setCellValue("A{$row}", $tenant->id);
                $sheet->setCellValue("B{$row}", $tenant->name);
                $sheet->setCellValue("C{$row}", $tenant->slug);
                $sheet->setCellValue("D{$row}", $tenant->email ?? '-');
                $sheet->setCellValue("E{$row}", $tenant->phone ?? '-');
                $sheet->setCellValue("F{$row}", $tenant->tax_number ?? '-');
                $sheet->setCellValue("G{$row}", $tenant->created_at->format('Y-m-d H:i'));
                $row++;
            }

            $writer = new Xlsx($spreadsheet);
            $filePath = 'exports/' . $log->filename;

            Storage::disk('public')->makeDirectory('exports');
            $fullPath = storage_path('app/public/' . $filePath);
            $writer->save($fullPath);

            $log->update([
                'status'   => 'completed',
                'file_path' => $filePath,
            ]);
        } catch (\Throwable $e) {
            $log->update([
                'status' => 'failed',
                'error'  => $e->getMessage(),
            ]);
        }
    }
}
