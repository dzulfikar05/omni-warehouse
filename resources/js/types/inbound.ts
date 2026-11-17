export type InboundStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'RECEIVING'
    | 'HOLD'
    | 'ON_HOLD'
    | 'COMMITTED'
    | 'CLOSED';

export interface InboundManifest {
    manifest_code: string;
    status: InboundStatus;
    supplier_name: string;
    vehicle_no: string;
    vehicle_type: string;
    driver_name: string;
    driver_phone: string;
    warehouse_name: string;
    dock_bay: string;
    operator_name: string;
    operator_initials?: string; // Dibuat optional (?) agar aman jika backend belum passing
    total_skus: number;
    total_po_units: number;
    good_units: number;
    damaged_units: number;
    progress_percentage: number;
}

export interface InboundItem {
    id: number; // Diselaraskan ke number (BigInt DB Laravel)
    sku_id: number;
    sku: string;
    barcode: string;
    product_name: string;
    category: string;
    batch_no: string;
    exp_date: string;
    po_qty: number;
    good_qty: number;
    damaged_qty: number;
    unit: string;
    target_rack: string;
    damage_note?: string;
    status: 'pending' | 'process' | 'valid' | 'issue';
    status_label: string;
}
