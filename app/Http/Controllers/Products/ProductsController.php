<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Menampilkan daftar produk (Index)
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $products = Product::when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('tenant_id', 'like', "%{$search}%")
                      ->orWhere('category_id', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menampilkan form untuk menambah produk baru
     */
    public function create()
    {
        return Inertia::render('Products/Create');
    }

    /**
     * Menyimpan data produk baru ke database
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id'   => 'required',
            'category_id' => 'required',
            'name'        => 'required|string|max:255',
        ]);

        Product::create([
            'tenant_id'   => $validated['tenant_id'],
            'category_id' => $validated['category_id'],
            'name'        => $validated['name'],
            'created_by'  => auth()->user()->name ?? 'System',
        ]);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Menampilkan detail produk tertentu
     */
    public function show(Product $product)
    {
        return Inertia::render('Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Menampilkan form edit produk
     */
    public function edit(Product $product)
    {
        return Inertia::render('Products/Edit', [
            'product' => $product
        ]);
    }

    /**
     * Memperbarui data produk di database
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'tenant_id'   => 'required',
            'category_id' => 'required',
            'name'        => 'required|string|max:255',
        ]);

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Menghapus produk dari database
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
}