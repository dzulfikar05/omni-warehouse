<?php

namespace App\Contracts;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductContract
{
    public function getPaginatedProducts(array $filters, int $perPage = 10): LengthAwarePaginator;
    public function getProductStats(array $filters): array;
    public function createProduct(array $data): Product;
    public function updateProduct(Product $product, array $data): Product;
    public function deleteProduct(Product $product): bool;
    public function exportPdf(string $tenantSlug): void;
    public function exportExcel(string $tenantSlug): void;
}
