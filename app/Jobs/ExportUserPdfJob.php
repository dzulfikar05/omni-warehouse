<?php

namespace App\Jobs;

use App\Models\ExportLog;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ExportUserPdfJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $exportLogId;
    protected array $filters;

    public function __construct(int $exportLogId, array $filters = [])
    {
        $this->exportLogId = $exportLogId;
        $this->filters = $filters;
    }

    public function handle(): void
    {
        $log = ExportLog::find($this->exportLogId);
        if (!$log) return;

        try {
            $log->update(['status' => 'processing']);

            $query = User::query()->whereNull('tenant_id')->with('roles');

            if (!empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->latest()->get();

            $pdf = Pdf::loadView('pdf.users_pdf', compact('users'))
                ->setPaper('a4', 'portrait');

            $fileName = 'exports/' . $log->filename;
            Storage::disk('public')->put($fileName, $pdf->output());

            $log->update([
                'status'    => 'completed',
                'file_path' => Storage::url($fileName),
            ]);
        } catch (Throwable $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
