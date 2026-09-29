export interface StockTransferItem {
    id: number;
    transfer_code: string;
    sku_code: string;
    product_name: string;
    from_warehouse: string;
    from_location: string;
    to_warehouse: string;
    to_location: string;
    quantity: number;
    status: 'COMPLETED' | 'IN_TRANSIT' | 'DRAFT';
    created_at: string;
    created_by: string;
    notes?: string;
}

export interface StockTransferSummary {
    total_transfers: number;
    in_transit: number;
    completed: number;
    total_units_moved: number;
}

export interface WarehouseOption {
    id: number;
    name: string;
    code: string;
}

export interface LocationOption {
    id: number;
    warehouse_id: number;
    name: string;
    code: string;
}

export interface SkuOption {
    id: number;
    code: string;
    name: string;
    current_stock: number;
}
