export interface ReconciliationItem {
    id: number;
    sku_id: number;
    location_id: number | null;
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
    status: 'Belum dihitung' | 'Match' | 'Defisit' | 'Surplus';
    is_counted: boolean;
    is_unlisted: boolean;
    notes?: string | null;
}

export interface OpnameSession {
    id: number;
    session_code: string;
    status: 'COUNTING' | 'REVIEW' | 'DRAFT' | 'ADJUSTED';
    warehouse_id: number;
    warehouse_name: string;
    warehouse_code: string;
    location_id: number | null;
    location_label: string;
    zone: string;
    auditor_name: string;
    cut_off_date: string;
    total_skus: number;
    total_system_units: number;
    total_physical: number;
    matched_skus: number;
    deficit_units: number;
    surplus_units: number;
    net_variance: number;
}

export interface StockOpnameWarehouse {
    id: number;
    name: string;
    code: string;
    locations: Array<{
        id: number;
        rack_code: string;
        zone: string | null;
    }>;
}

export interface OpnameSessionSummary {
    id: number;
    session_code: string;
    status: OpnameSession['status'];
    location_label: string;
    warehouse_name: string;
    warehouse_code: string;
    auditor_name: string | null;
    created_at: string;
    total_items: number;
    counted_items: number;
}

export interface StockOpnamePageProps {
    session: OpnameSession | null;
    items: ReconciliationItem[];
    warehouses: StockOpnameWarehouse[];
    sessions: {
        data: OpnameSessionSummary[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
    };
}
