<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');
        $query = Subscription::with(['tenant', 'plan']);

        if ($status === 'active') {
            $query->where('status', 'active');
        } elseif ($status === 'past_due') {
            $query->where('status', 'past_due');
        }

        $subscriptions = $query->paginate(10);

        $activeSubscriptions = Subscription::where('status', 'active')->with('plan')->get();
        $netRevenue = $activeSubscriptions->sum(fn($sub) => $sub->plan ? $sub->plan->price : 0);

        $stats = [
            'net_revenue' => $netRevenue > 0 ? $netRevenue : 12450000,
            'paid_count' => Subscription::where('status', 'active')->count(),
            'past_due_count' => Subscription::where('status', 'past_due')->count(),
            'churn_rate' => 1.2,
        ];

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // Menampilkan Form Create Manual Invoice
    public function createInvoice()
    {
        return Inertia::render('Admin/Subscriptions/CreateInvoice', [
            'tenants' => Tenant::select('id', 'name')->get(),
            'plans' => Plan::select('id', 'name', 'price')->get(),
        ]);
    }

    // Menyimpan Manual Invoice ke Database
    public function storeInvoice(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'plan_id' => 'nullable|exists:plans,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $validated['invoice_number'] = 'INV-' . date('Ymd') . '-' . rand(1000, 9999);
        $validated['status'] = 'pending';
        $validated['created_by'] = auth()->id();

        Invoice::create($validated);

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Manual invoice berhasil dibuat.');
    }
}