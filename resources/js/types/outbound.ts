export interface OutboundManifest {
    manifest_code: string;
    status: 'READY_TO_PICK' | 'PICKING' | 'PACKING' | 'DISPATCHED' | 'HOLD';
    customer_name: string;
    so_number: string;
    vehicle_no: string;
    vehicle_type: string;
    driver_name: string;
    driver_phone: string;
    warehouse_name: string;
    dock_bay: string;
    operator_name?: string;
    operator_initials?: string;
    total_skus: number;
    total_so_units: number;
    picked_units: number;
    packed_units: number;
    progress_percentage: number;
    created_at?: string;
}

export interface OutboundItem {
    id: string;
    sku: string;
    barcode: string;
    product_name: string;
    category: string;
    source_rack: string;
    batch_no: string;
    exp_date: string;
    so_qty: number;
    picked_qty: number;
    packed_qty: number;
    unit: string;
    status: 'pending' | 'picking' | 'packed' | 'issue';
    status_label: string;
    issue_note?: string;
}
