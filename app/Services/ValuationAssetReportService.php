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
        $perPage = $filters['per_page'] ?? 10;
        $search = $filters['search'] ?? null;
        $warehouseId = $filters['warehouse_id'] ?? null;
        $categoryId = $filters['category_id'] ?? null;
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

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

        $valuations = $query->paginate($perPage)->withQueryString();

        $totalAssetValue = DB::table('inventory_stocks')
            ->join('skus', 'inventory_stocks.sku_id', '=', 'skus.id')
            ->join('products', 'skus.product_id', '=', 'products.id')
            ->where('products.tenant_id', $tenant->id)
            ->sum(DB::raw('inventory_stocks.quantity * skus.base_cost'));

        return [
            'reports' => $valuations,
            'summary' => [
                'total_asset_value' => $totalAssetValue,
                'stock_adjustment' => 0,
                'damaged_units' => 0,
                'reserved_stock' => 0,
            ],
        ];
    }
}
