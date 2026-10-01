<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Unit;
use Inertia\Inertia;

class UnitsController extends Controller
{
    /**
     * Menampilkan daftar unit.
     */
    public function index(Request $request)
    {
        $tenantSlug = $request->route('tenant_slug');
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'latest');
        $perPage = (int) $request->input('per_page', 10);

        // Batasi pilihan jumlah data per halaman
        if (! in_array($perPage, [10, 25, 50])) {
            $perPage = 10;
        }

        $units = Unit::query()
            // Filter Search
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%")
                        ->orWhere('symbol', 'like', "%{$search}%");
                });
            })
            // Filter Sorting
            ->when($sortBy, function ($query, $sortBy) {
                match ($sortBy) {
                    'oldest' => $query->oldest(),
                    'name_asc' => $query->orderBy('name', 'asc'),
                    'name_desc' => $query->orderBy('name', 'desc'),
                    default => $query->latest(),
                };
            }, function ($query) {
                $query->latest();
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render(
            'Tenant/Inventory Management/Units/index',
            [
                'tenant_slug' => $tenantSlug,
                'units' => $units,
                'filters' => [
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'per_page' => (string) $perPage,
                ],
            ]
        );
    }

    /**
     * Menampilkan form untuk menambah unit baru.
     */
    public function create(Request $request)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Units/create',
            [
                'tenant_slug' => $request->route('tenant_slug'),
            ]
        );
    }

    /**
     * Menyimpan unit baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['required', 'string', 'max:10'],
        ]);

        Unit::create([
            'name' => $validated['name'],
            'symbol' => $validated['symbol'],
        ]);

        return redirect()
            ->route('tenant.inventory.units.index', [
                'tenant_slug' => $request->route('tenant_slug'),
            ])
            ->with('success', 'Unit created successfully.');
    }

    /**
     * Menampilkan detail unit.
     */
    public function show(Request $request, $tenant_slug, Unit $unit)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Units/show',
            [
                'tenant_slug' => $tenant_slug,
                'unit' => $unit,
            ]
        );
    }

    /**
     * Menampilkan form edit unit.
     */
    public function edit(Request $request, $tenant_slug, Unit $unit)
    {
        return Inertia::render(
            'Tenant/Inventory Management/Units/edit',
            [
                'tenant_slug' => $tenant_slug,
                'unit' => $unit,
            ]
        );
    }

    /**
     * Memperbarui data unit.
     */
    public function update(
        Request $request,
        $tenant_slug,
        Unit $unit
    ) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['required', 'string', 'max:10'],
        ]);

        $unit->update($validated);

        return redirect()
            ->route('tenant.inventory.units.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'Unit updated successfully.');
    }

    /**
     * Menghapus unit.
     */
    public function destroy(
        Request $request,
        $tenant_slug,
        Unit $unit
    ) {
        $unit->delete();

        return redirect()
            ->route('tenant.inventory.units.index', [
                'tenant_slug' => $tenant_slug,
            ])
            ->with('success', 'Unit deleted successfully.');
    }
}