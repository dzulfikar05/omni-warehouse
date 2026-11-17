export type OutboundStatus =
    | 'DRAFT'
    | 'READY_TO_PICK'
    | 'PICKING'
    | 'PACKING'
    | 'DISPATCHED'
    | 'HOLD'
    | 'COMMITTED'
    | 'CLOSED';

export interface OutboundManifest {
    manifest_code: string;
    status: OutboundStatus;
    customer_name: string;
    vehicle_no?: string;
    vehicle_type?: string;
    driver_name?: string;
    driver_phone?: string;
    warehouse_name?: string;
    dock_bay?: string;
    operator_name?: string;
    operator_initials?: string;
    total_skus: number;
    total_po_units?: number;
    total_so_units?: number;
    good_units?: number;
    damaged_units?: number;
    packed_units?: number;
    so_number?: string;
    created_at?: string;
}

export interface OutboundItem {
    id: number;
    sku_id: number;
    sku: string;
    barcode: string;
    product_name: string;
    category?: string;
    batch_no?: string;
    exp_date?: string;
    so_qty: number;
    good_qty: number;
    damaged_qty: number;
    packed_qty?: number;
    unit: string;
    target_rack?: string | null;
    source_rack?: string | null;
    damage_note?: string | null;
    issue_note?: string | null;
    status: 'pending' | 'picking' | 'packed' | 'issue';
    status_label: string;
}
