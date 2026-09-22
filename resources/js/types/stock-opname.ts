export interface ReconciliationItem {
    id: number;
    sku: string;
    barcode: string;
    name: string;
    batch: string;
    exp_date: string;
    rack: string;
    system_qty: number;
    physical_qty: number;
    unit: string;
    variance: number;
    status: 'Match' | 'Defisit' | 'Surplus';
    notes?: string;
}

export interface OpnameSession {
    id: number;
    session_code: string;
    status: 'RECONCILING' | 'COMPLETED' | 'DRAFT';
    warehouse_name: string;
    warehouse_code: string;
    zone: string;
    auditor_name: string;
    auditor_avatar?: string;
    cut_off_date: string;
    total_skus: number;
    total_system_units: number;
    matched_skus: number;
    deficit_units: number;
    surplus_units: number;
    net_variance: number;
}

export interface StockOpnamePageProps {
    session: OpnameSession;
    items: ReconciliationItem[];
}
