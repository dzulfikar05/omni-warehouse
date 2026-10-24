<?php

namespace App\Services;

use App\Contracts\StockSummaryReportContract;
use App\Models\InventoryStock;
use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class StockSummaryReportService implements StockSummaryReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array
    {
        $perPage     = $filters['per_page'] ?? 10;
        $search      = $filters['search'] ?? null;
        $warehouseId = $filters['warehouse_id'] ?? null;
        $categoryId  = $filters['category_id'] ?? null;
        $status      = $filters['status'] ?? null;
        $dateFrom    = $filters['date_from'] ?? null;
        $dateTo      = $filters['date_to'] ?? null;
        $sortBy      = $filters['sort_by'] ?? 'updated_at';
        $sortOrder   = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = InventoryStock::query()
            ->select('inventory_stocks.*')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->join('locations', 'inventory_stocks.location_id', '=', 'locations.id')
            ->where('products.tenant_id', $tenant->id)
            ->with(['sku.product.category', 'sku.unit', 'location.warehouse']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('inventory_stocks.batch_number', 'like', "%{$search}%")
                  ->orWhere('skus.sku_code', 'like', "%{$search}%")
                  ->orWhere('products.name', 'like', "%{$search}%");
            });
        }

        if ($warehouseId) {
            $query->where('locations.warehouse_id', $warehouseId);
        }

        if ($categoryId) {
            $query->where('products.category_id', $categoryId);
        }

        if ($status === 'in_stock') {
            $query->where('inventory_stocks.quantity', '>', 15);
        } elseif ($status === 'low_stock') {
            $query->whereBetween('inventory_stocks.quantity', [1, 15]);
        } elseif ($status === 'out_of_stock') {
            $query->where('inventory_stocks.quantity', '<=', 0);
        }

        if ($dateFrom) {
            $query->whereDate('inventory_stocks.created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('inventory_stocks.created_at', '<=', $dateTo);
        }

        // Apply Sorting
        match ($sortBy) {
            'quantity' => $query->orderBy('inventory_stocks.quantity', $sortOrder),
            'batch_number' => $query->orderBy('inventory_stocks.batch_number', $sortOrder),
            'status' => $query->orderBy('inventory_stocks.quantity', $sortOrder),
            'sku_id' => $query->orderBy('skus.sku_code', $sortOrder),
            'product_name' => $query->orderBy('products.name', $sortOrder),
            'base_cost' => $query->orderBy('skus.base_cost', $sortOrder),
            'total_value' => $query->orderBy(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'), $sortOrder),
            default => $query->orderBy('inventory_stocks.updated_at', $sortOrder),
        };

        $stocks = $query->paginate($perPage)->withQueryString();

        // Cards Summary Calculation
        $totalProducts = Product::where('tenant_id', $tenant->id)->count();
        $totalQuantity = InventoryStock::whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id))->sum('quantity');

        $totalInventoryValue = DB::table('inventory_stocks')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('products.tenant_id', $tenant->id)
            ->sum(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'));

        $lowStockItems = InventoryStock::whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->whereBetween('quantity', [1, 15])->count();

        $outOfStock = InventoryStock::whereHas('sku.product', fn($q) => $q->where('tenant_id', $tenant->id))
            ->where('quantity', '<=', 0)->count();

        return [
            'reports' => $stocks,
            'summary' => [
                'total_products'        => $totalProducts,
                'total_quantity'        => (float) $totalQuantity,
                'total_inventory_value' => (float) $totalInventoryValue,
                'low_stock_items'       => $lowStockItems,
                'out_of_stock'          => $outOfStock,
            ],
        ];
    }
}
