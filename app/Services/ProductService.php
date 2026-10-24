<?php

namespace App\Services;

use App\Contracts\ProductContract;
use App\Jobs\ExportProductExcelJob;
use App\Jobs\ExportProductPdfJob;
use App\Models\ExportLog;
use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService implements ProductContract
{
    public function getPaginatedProducts(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $sortBy    = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return Product::query()
            ->with(['category', 'skus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($catQuery) use ($search) {
                            $catQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($sortBy, function ($q) use ($sortBy, $sortOrder) {
                match ($sortBy) {
                    'id', 'name', 'category_id', 'status', 'created_at' => $q->orderBy($sortBy, $sortOrder),
                    default                                            => $q->orderBy('created_at', $sortOrder),
                };
            }, function ($q) use ($sortOrder) {
                $q->orderBy('created_at', $sortOrder);
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getProductStats(array $filters): array
    {
        $baseQuery = Product::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($catQuery) use ($search) {
                            $catQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['category_id'] ?? null, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            });

        return [
            'total_products'   => (clone $baseQuery)->count(),
            'active_products'  => (clone $baseQuery)->where('status', 'active')->count(),
            'draft_products'   => (clone $baseQuery)->where('status', 'draft')->count(),
            'total_skus_count' => (clone $baseQuery)->withCount('skus')->get()->sum('skus_count'),
        ];
    }

    public function createProduct(array $data): Product
    {
        $tenant = app('current_tenant');

        return Product::create([
            'tenant_id'   => $tenant?->id,
            'category_id' => $data['category_id'],
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'status'      => $data['status'] ?? 'active',
            'created_by'  => auth()->id(),
        ]);
    }

    public function updateProduct(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    public function exportPdf(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $products = Product::with(['category', 'skus'])->get()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Product_Master_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportProductPdfJob::dispatch($log->id, $products);
    }

    public function exportExcel(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $products = Product::with(['category', 'skus'])->get()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Product_Master_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportProductExcelJob::dispatch($log->id, $products);
    }
}
