<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ExportSubscriptionPdfJob;
use App\Jobs\ExportSubscriptionExcelJob;
use App\Models\ExportLog;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $search   = $request->get('search');
        $status   = $request->get('status', 'all');
        $planId   = $request->get('plan_id');
        $dateFrom = $request->get('date_from');
        $dateTo   = $request->get('date_to');

        $query = Subscription::with(['tenant:id,name,slug,email', 'plan:id,name,price']);

        // Filter Pencarian Tenant Name / Slug
        if ($search) {
            $query->whereHas('tenant', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Filter Status Subscription
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Filter Plan Tier
        if ($planId) {
            $query->where('plan_id', $planId);
        }

        // Filter Rentang Tanggal
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $subscriptions = $query->latest()->paginate(10)->withQueryString();

        // Perhitungan Statistik Real-time
        $activeSubscriptions = Subscription::where('status', 'active')->with('plan')->get();
        $netRevenue = $activeSubscriptions->sum(fn($sub) => $sub->plan ? $sub->plan->price : 0);

        $stats = [
            'net_revenue'    => $netRevenue,
            'active_count'   => Subscription::where('status', 'active')->count(),
            'past_due_count' => Subscription::where('status', 'past_due')->count(),
            'total_count'    => Subscription::count(),
        ];

        $plans = Plan::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'stats'         => $stats,
            'plans'         => $plans,
            'filters'       => [
                'search'    => $search,
                'status'    => $status,
                'plan_id'   => $planId,
                'date_from' => $dateFrom,
                'date_to'   => $dateTo,
            ],
        ]);
    }

    public function createInvoice()
    {
        return Inertia::render('Admin/Subscriptions/CreateInvoice', [
            'tenants' => Tenant::select('id', 'name')->orderBy('name')->get(),
            'plans'   => Plan::select('id', 'name', 'price')->orderBy('price')->get(),
        ]);
    }

    public function storeInvoice(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'plan_id'   => 'nullable|exists:plans,id',
            'amount'    => 'required|numeric|min:0',
            'due_date'  => 'required|date',
            'notes'     => 'nullable|string',
        ]);

        $validated['invoice_number'] = 'INV-' . date('Ymd') . '-' . rand(1000, 9999);
        $validated['status']         = 'pending';
        $validated['created_by']     = auth()->id();

        Invoice::create($validated);

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Manual invoice berhasil diterbitkan.');
    }

    public function exportPdf(Request $request): RedirectResponse
    {
        $filters = $request->only(['search', 'status', 'plan_id', 'date_from', 'date_to']);

        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Subscription_Report_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportSubscriptionPdfJob::dispatch($log->id, $filters);

        return back()->with('success', 'Added to export queue. Check the bell/download icon in the navbar.');
    }

    public function exportExcel(Request $request): RedirectResponse
    {
        $filters = $request->only(['search', 'status', 'plan_id', 'date_from', 'date_to']);

        $log = ExportLog::create([
            'tenant_id' => null,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Subscription_Report_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportSubscriptionExcelJob::dispatch($log->id, $filters);

        return back()->with('success', 'Added to export queue. Check the bell/download icon in the navbar.');
    }

    public function getExportNotifications(): JsonResponse
    {
        $logs = ExportLog::where('user_id', auth()->id())
            ->latest()
            ->take(5)
            ->get();

        return response()->json($logs);
    }
}
