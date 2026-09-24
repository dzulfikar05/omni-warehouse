export type InboundStatus = 'valid' | 'process' | 'issue' | 'pending';

export interface InboundItem {
    id: string;
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
    status: InboundStatus;
    status_label: string;
    damage_note?: string;
}

export interface InboundManifest {
    manifest_code: string;
    status: 'RECEIVING' | 'HOLD' | 'CLOSED';
    supplier_name: string;
    vehicle_no: string;
    vehicle_type: string;
    driver_name: string;
    driver_phone: string;
    warehouse_name: string;
    dock_bay: string;
    operator_name: string;
    operator_initials: string;
    total_skus: number;
    total_po_units: number;
    good_units: number;
    damaged_units: number;
    progress_percentage: number;
}

export interface InboundPageProps {
    manifest: InboundManifest;
    items: InboundItem[];
}
