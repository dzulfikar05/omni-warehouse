<?php

namespace App\Http\Controllers\Tenant;

use App\Contracts\SupplierContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\SupplierRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    protected SupplierContract $service;

    public function __construct(SupplierContract $service)
    {
        $this->service = $service;
    }

    public function index(Request $request, string $tenant_slug): Response
    {
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);

        $suppliers = $this->service->getPaginatedSuppliers($tenant_slug, $search, $perPage);

        return Inertia::render('Tenant/Contacts/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create(string $tenant_slug): Response
    {
        return Inertia::render('Tenant/Contacts/Suppliers/Create');
    }

    public function store(SupplierRequest $request, string $tenant_slug): RedirectResponse
    {
        $this->service->storeSupplier($tenant_slug, $request->validated());

        return to_route('tenant.contacts.suppliers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Supplier created successfully.');
    }

    public function show(string $tenant_slug, string $id): Response
    {
        $supplier = $this->service->getSupplierById($tenant_slug, $id);

        return Inertia::render('Tenant/Contacts/Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit(string $tenant_slug, string $id): Response
    {
        $supplier = $this->service->getSupplierById($tenant_slug, $id);

        return Inertia::render('Tenant/Contacts/Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(SupplierRequest $request, string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->updateSupplier($tenant_slug, $id, $request->validated());

        return to_route('tenant.contacts.suppliers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(string $tenant_slug, string $id): RedirectResponse
    {
        $this->service->deleteSupplier($tenant_slug, $id);

        return to_route('tenant.contacts.suppliers.index', ['tenant_slug' => $tenant_slug])
            ->with('success', 'Supplier deleted successfully.');
    }
}
