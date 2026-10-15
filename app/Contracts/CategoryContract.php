<?php

namespace App\Contracts;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CategoryContract
{
    public function getPaginatedCategories(array $filters, int $perPage = 10): LengthAwarePaginator;

    public function getCategoryStats(array $filters): array;

    public function createCategory(array $data): Category;

    public function updateCategory(Category $category, array $data): Category;

    public function deleteCategory(Category $category): bool;

    public function exportPdf(string $tenantSlug): void;

    public function exportExcel(string $tenantSlug): void;
}
