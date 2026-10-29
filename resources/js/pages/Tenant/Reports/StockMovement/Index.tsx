import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import { PageHeader } from '@/components/page-header';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Activity, FileText, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';

interface Warehouse {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface StockMovementProps {
    reports: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    summary: {
        total_inbound: number;
        total_outbound: number;
        total_transfer: number;
        total_movements: number;
    };
    warehouses: Warehouse[];
    categories: Category[];
    filters: {
        search?: string;
        per_page?: string;
        warehouse_id?: string;
        category_id?: string;
        transaction_type?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
}

export default function Index({ reports, summary, warehouses, categories, filters }: StockMovementProps) {
    const { t } = useTranslation();
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [tempWarehouse, setTempWarehouse] = useState(filters.warehouse_id || 'all');
    const [tempCategory, setTempCategory] = useState(filters.category_id || 'all');
    const [tempType, setTempType] = useState(filters.transaction_type || 'all');
    const [tempDateFrom, setTempDateFrom] = useState(filters.date_from || '');
    const [tempDateTo, setTempDateTo] = useState(filters.date_to || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters.sort_order as 'asc' | 'desc') || 'desc'
    );

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    const applyFilters = useCallback(
        (
            newSearch: string,
            newPerPage: string,
            warehouse: string,
            category: string,
            type: string,
            dateFrom: string,
            dateTo: string,
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            router.get(
                window.location.pathname,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    warehouse_id: warehouse !== 'all' ? warehouse : undefined,
                    category_id: category !== 'all' ? category : undefined,
                    transaction_type: type !== 'all' ? type : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [sortBy, sortOrder]
    );

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (q: string, p: string, w: string, c: string, t: string, df: string, dt: string) =>
                    applyFilters(q, p, w, c, t, df, dt),
                500
            ),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage, tempWarehouse, tempCategory, tempType, tempDateFrom, tempDateTo);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempWarehouse, tempCategory, tempType, tempDateFrom, tempDateTo);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortOrder(direction);
        applyFilters(
            search,
            perPage,
            tempWarehouse,
            tempCategory,
            tempType,
            tempDateFrom,
            tempDateTo,
            field,
            direction
        );
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempWarehouse, tempCategory, tempType, tempDateFrom, tempDateTo);
    };

    const handleResetFilter = () => {
        setTempWarehouse('all');
        setTempCategory('all');
        setTempType('all');
        setTempDateFrom('');
        setTempDateTo('');
        setSortBy('created_at');
        setSortOrder('desc');
        applyFilters(search, perPage, 'all', 'all', 'all', '', '', 'created_at', 'desc');
    };

    const getFilterPayload = () => ({
        search: search || undefined,
        warehouse_id: tempWarehouse !== 'all' ? tempWarehouse : undefined,
        category_id: tempCategory !== 'all' ? tempCategory : undefined,
        transaction_type: tempType !== 'all' ? tempType : undefined,
        date_from: tempDateFrom || undefined,
        date_to: tempDateTo || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/reports/stock-movement/export/pdf`, getFilterPayload());
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/reports/stock-movement/export/excel`, getFilterPayload());
    };

    const canExport = can('tenant.stock_movement.export') || can('stock_movement.export');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: "DATE & TIME", sortField: 'created_at' },
        { label: "SKU CODE", sortField: 'sku_id' },
        { label: "PRODUCT NAME", sortField: 'product_name' },
        { label: "TYPE", sortField: 'transaction_type' },
        'SOURCE',
        'DESTINATION',
        { label: "MOVED QTY", sortField: 'quantity' },
        'OPERATOR',
    ];

    return (
        <>
            <Head title={t("Stock Movement Report")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Stock Movement Report")}
                    description={t("Real-time transaction stock ledger tracking inbound, outbound, and location transfers.")}
                    renderAction={
                        <div className="flex items-center gap-2">
                            {canExport && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPdf}
                                        className="h-9 gap-1.5 border-red-200 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    >
                                        <FileText size={15} /> {t("Export PDF")}</Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-emerald-200 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                    >
                                        <FileSpreadsheet size={15} /> {t("Export Excel")}</Button>
                                </>
                            )}
                        </div>
                    }
                />

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Inbound Qty")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {summary.total_inbound.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <ArrowDownLeft size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Outbound Qty")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {summary.total_outbound.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/50">
                            <ArrowUpRight size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Transfer Qty")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {summary.total_transfer.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <ArrowLeftRight size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Transactions")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary.total_movements.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50">
                            <Activity size={22} />
                        </div>
                    </div>
                </div>

                <TableFilter
                    search={search}
                    onSearchChange={onSearchChange}
                    perPage={perPage}
                    onPerPageChange={onPerPageChange}
                >
                    <FilterDropdown onApply={handleApplyFilter} onReset={handleResetFilter}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{t("Warehouse")}</Label>
                                <Select value={tempWarehouse} onValueChange={setTempWarehouse}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("All Warehouse")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("All Warehouse")}</SelectItem>
                                        {warehouses?.map((w) => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{t("Category")}</Label>
                                <Select value={tempCategory} onValueChange={setTempCategory}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("All Category")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("All Category")}</SelectItem>
                                        {categories?.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{t("Movement Type")}</Label>
                                <Select value={tempType} onValueChange={setTempType}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("All Type")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("All Type")}</SelectItem>
                                        <SelectItem value="IN">{t("Inbound (IN)")}</SelectItem>
                                        <SelectItem value="OUT">{t("Outbound (OUT)")}</SelectItem>
                                        <SelectItem value="TRANSFER">{t("Transfer")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">{t("Date From")}</Label>
                                    <Input
                                        type="date"
                                        value={tempDateFrom}
                                        onChange={(e) => setTempDateFrom(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">{t("Date To")}</Label>
                                    <Input
                                        type="date"
                                        value={tempDateTo}
                                        onChange={(e) => setTempDateTo(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                <DataTable
                    headers={tableHeaders}
                    data={reports.data}
                    pagination={reports}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(item: any) => {
                        const rawType = item.transaction?.transaction_type?.toUpperCase() || 'MOVEMENT';
                        let typeBadge = <Badge className="bg-blue-600 text-white">{rawType}</Badge>;

                        if (rawType.includes('IN')) {
                            typeBadge = <Badge className="bg-emerald-600 text-white">{t("INBOUND")}</Badge>;
                        } else if (rawType.includes('OUT')) {
                            typeBadge = <Badge className="bg-rose-600 text-white">{t("OUTBOUND")}</Badge>;
                        } else if (rawType.includes('TRANSFER')) {
                            typeBadge = <Badge className="bg-purple-600 text-white">{t("TRANSFER")}</Badge>;
                        }

                        const fromWh = item.from_location?.warehouse?.name || '-';
                        const toWh = item.to_location?.warehouse?.name || '-';

                        return (
                            <>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
                                </TableCell>
                                <TableCell className="font-mono text-xs font-semibold">{item.sku?.sku_code || '-'}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">{item.sku?.product?.name || '-'}</TableCell>
                                <TableCell>{typeBadge}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{fromWh}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{toWh}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">
                                    {Number(item.quantity || 0).toLocaleString()} <span className="font-normal text-muted-foreground">{item.sku?.unit?.symbol || ''}</span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.transaction?.user?.name || t("System")}</TableCell>
                            </>
                        );
                    }}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: "Reports", href: '#' },
        { title: "Stock Movement", href: '#' },
    ],
};
