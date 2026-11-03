export interface WarehouseOption {
    id: number;
    name: string;
    code: string;
}

export interface LocationOption {
    id: number;
    warehouse_id: number;
    rack_code: string; // db column: rack_code
    zone: string | null; // db column: zone
    warehouse_name: string;
    desc?: string;
    is_active: boolean;
}

export interface SkuLocationStock {
    location_id: number;
    quantity: number;
    batch_number: string | null;
    expiry_date: string | null;
}

export interface SkuOption {
    id: number;
    code: string;
    name: string;
    current_stock: number;
    locations: SkuLocationStock[];
}

export interface StockTransferItemDetail {
    id: number;
    sku_id: number;
    sku_code: string;
    product_name: string;
    from_location_id: number;
    from_rack: string; // format: ZONE - RACKCODE
    to_location_id: number;
    to_rack: string; // format: ZONE - RACKCODE
    quantity: number;
    batch_number: string | null;
    expiry_date: string | null;
}

// Representasi Dokumen Transaksi Header (Header-Detail Pattern)
export interface StockTransferHeaderItem {
    id: number;
    transfer_code: string; // transactions.local_uuid
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'draft';
    total_skus: number;
    total_quantity: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by_name?: string;
    items: StockTransferItemDetail[];
}

export interface StockTransferSummary {
    total_transfers: number;
    in_transit: number;
    completed: number;
    total_units_moved: number;
}
