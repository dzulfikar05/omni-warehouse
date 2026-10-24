<?php

namespace App\Services;

use App\Contracts\ValuationAssetReportContract;
use App\Models\InventoryStock;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class ValuationAssetReportService implements ValuationAssetReportContract
{
    public function getReportData(Tenant $tenant, array $filters): array
    {
        $perPage     = $filters['per_page'] ?? 10;
        $search      = $filters['search'] ?? null;
        $warehouseId = $filters['warehouse_id'] ?? null;
        $categoryId  = $filters['category_id'] ?? null;
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
            ->with(['sku.product.category', 'location.warehouse']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('skus.sku_code', 'like', "%{$search}%")
                  ->orWhere('products.name', 'like', "%{$search}%");
            });
        }

        if ($warehouseId) {
            $query->where('locations.warehouse_id', $warehouseId);
        }

        if ($categoryId) {
            $query->where('products.category_id', $categoryId);
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
            'sku_id' => $query->orderBy('skus.sku_code', $sortOrder),
            'product_name' => $query->orderBy('products.name', $sortOrder),
            'base_cost' => $query->orderBy('skus.base_cost', $sortOrder),
            'total_value' => $query->orderBy(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'), $sortOrder),
            default => $query->orderBy('inventory_stocks.updated_at', $sortOrder),
        };

        $valuations = $query->paginate($perPage)->withQueryString();

        $totalAssetValue = DB::table('inventory_stocks')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('products.tenant_id', $tenant->id)
            ->sum(DB::raw('inventory_stocks.quantity * COALESCE(skus.base_cost, 0)'));

        return [
            'reports' => $valuations,
            'summary' => [
                'total_asset_value' => (float) $totalAssetValue,
                'stock_adjustment'  => 0,
                'damaged_units'     => 0,
                'reserved_stock'    => 0,
            ],
        ];
    }
}
