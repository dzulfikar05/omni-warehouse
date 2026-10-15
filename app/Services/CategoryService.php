<?php

namespace App\Services;

use App\Contracts\CategoryContract;
use App\Jobs\ExportCategoryExcelJob;
use App\Jobs\ExportCategoryPdfJob;
use App\Models\Category;
use App\Models\ExportLog;
use App\Models\Tenant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryService implements CategoryContract
{
    public function getPaginatedCategories(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return Category::query()
            ->withCount('products')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('id', 'like', "%{$search}%")
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            })
            ->when($filters['sort_by'] ?? 'latest', function ($query, $sortBy) {
                match ($sortBy) {
                    'oldest'    => $query->oldest(),
                    'name_asc'  => $query->orderBy('name', 'asc'),
                    'name_desc' => $query->orderBy('name', 'desc'),
                    default     => $query->latest(),
                };
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getCategoryStats(array $filters): array
    {
        $baseQuery = Category::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            });

        return [
            'total_categories'     => (clone $baseQuery)->count(),
            'total_products_count' => (clone $baseQuery)->withCount('products')->get()->sum('products_count'),
            'categories_with_desc' => (clone $baseQuery)->whereNotNull('desc')->where('desc', '!=', '')->count(),
        ];
    }

    public function createCategory(array $data): Category
    {
        $tenant = app('current_tenant');

        return Category::create([
            'tenant_id'  => $tenant?->id,
            'name'       => $data['name'],
            'desc'       => $data['desc'] ?? null,
            'created_by' => auth()->id(),
        ]);
    }

    public function updateCategory(Category $category, array $data): Category
    {
        $category->update([
            'name' => $data['name'],
            'desc' => $data['desc'] ?? null,
        ]);

        return $category;
    }

    public function deleteCategory(Category $category): bool
    {
        return $category->delete();
    }

    public function exportPdf(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $categories = Category::withCount('products')->get()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'pdf',
            'filename'  => 'Category_Master_' . date('Ymd_His') . '.pdf',
            'status'    => 'pending',
        ]);

        ExportCategoryPdfJob::dispatch($log->id, $categories);
    }

    public function exportExcel(string $tenantSlug): void
    {
        $tenant = Tenant::where('slug', $tenantSlug)->firstOrFail();
        $categories = Category::withCount('products')->get()->toArray();

        $log = ExportLog::create([
            'tenant_id' => $tenant->id,
            'user_id'   => auth()->id(),
            'type'      => 'excel',
            'filename'  => 'Category_Master_' . date('Ymd_His') . '.xlsx',
            'status'    => 'pending',
        ]);

        ExportCategoryExcelJob::dispatch($log->id, $categories);
    }
}
