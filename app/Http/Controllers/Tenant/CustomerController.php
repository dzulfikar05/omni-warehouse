<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\CustomerContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\CustomerRequest;
use App\Models\Customer;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    protected CustomerContract $service;

    public function __construct(CustomerContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $tenant = Tenant::where('slug', $tenant_slug)->firstOrFail();
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        $customers = $this->service->getPaginatedCustomers($tenant_slug, $search, $perPage);

        // Agregasi Statistik berbasis Tenant
        $stats = [
            'total_customers' => Customer::where('tenant_id', $tenant->id)->count(),
            'new_this_month'  => Customer::where('tenant_id', $tenant->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'has_contact'     => Customer::where('tenant_id', $tenant->id)
                ->where(function ($q) {
                    $q->whereNotNull('phone')->orWhereNotNull('email');
                })
                ->count(),
        ];

        return Inertia::render('Tenant/Contacts/Customers/Index', [
            'customers' => $customers,
            'stats'     => $stats,
            'filters'   => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(string $tenant_slug): Response
    {
        return Inertia::render('Tenant/Contacts/Customers/Create');
    }

    public function store(CustomerRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->storeCustomer($tenant_slug, $request->validated());

        return to_route('tenant.contacts.customers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Customer created successfully.');
    }

    public function show(string $tenant_slug, string $id): Response
    {
        $customer = $this->service->getCustomerById($tenant_slug, $id);

        // Load data riwayat outbound dan item barang yang dibeli secara riil
        $customer->load([
            'outbounds' => function ($query) {
                $query->with(['items.sku.product'])->latest()->limit(5);
            },
            'purchased_products' => function ($query) {
                $query->with(['sku.product'])->limit(10);
            }
        ]);

        return Inertia::render('Tenant/Contacts/Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function edit(string $tenant_slug, string $id): Response
    {
        $customer = $this->service->getCustomerById($tenant_slug, $id);

        return Inertia::render('Tenant/Contacts/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(CustomerRequest $request, string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->updateCustomer($tenant_slug, $id, $request->validated());

        return to_route('tenant.contacts.customers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->deleteCustomer($tenant_slug, $id);

        return to_route('tenant.contacts.customers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Customer deleted successfully.');
    }
}
