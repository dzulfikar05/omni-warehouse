<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\CustomerContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\CustomerRequest;
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
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        $customers = $this->service->getPaginatedCustomers($tenant_slug, $search, $perPage);

        return Inertia::render('Tenant/Contacts/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'per_page']),
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
