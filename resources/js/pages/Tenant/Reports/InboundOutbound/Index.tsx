import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
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
import { ArrowDownRight, ArrowUpRight, Clock, FileText, FileSpreadsheet, PackageCheck } from 'lucide-react';
import { usePermission } from '@/utils/permission';

interface Warehouse {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface InboundOutboundProps {
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
        total_received_units: number;
        total_dispatch_units: number;
        open_inbound_pos: number;
        open_outbound_pos: number;
    };
    warehouses: Warehouse[];
    categories: Category[];
    filters: {
        search?: string;
        per_page?: string;
        warehouse_id?: string;
        category_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ reports, summary, warehouses, categories, filters }: InboundOutboundProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [tempWarehouse, setTempWarehouse] = useState(filters.warehouse_id || 'all');
    const [tempCategory, setTempCategory] = useState(filters.category_id || 'all');
    const [tempStatus, setTempStatus] = useState(filters.status || 'all');
    const [tempDateFrom, setTempDateFrom] = useState(filters.date_from || '');
    const [tempDateTo, setTempDateTo] = useState(filters.date_to || '');

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
            status: string,
            dateFrom: string,
            dateTo: string
        ) => {
            router.get(
                window.location.pathname,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    warehouse_id: warehouse !== 'all' ? warehouse : undefined,
                    category_id: category !== 'all' ? category : undefined,
                    status: status !== 'all' ? status : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        []
    );

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (q: string, p: string, w: string, c: string, s: string, df: string, dt: string) =>
                    applyFilters(q, p, w, c, s, df, dt),
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
        debouncedSearch(value, perPage, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo);
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo);
    };

    const handleResetFilter = () => {
        setTempWarehouse('all');
        setTempCategory('all');
        setTempStatus('all');
        setTempDateFrom('');
        setTempDateTo('');
        applyFilters(search, perPage, 'all', 'all', 'all', '', '');
    };

    const getFilterPayload = () => ({
        search: search || undefined,
        warehouse_id: tempWarehouse !== 'all' ? tempWarehouse : undefined,
        category_id: tempCategory !== 'all' ? tempCategory : undefined,
        status: tempStatus !== 'all' ? tempStatus : undefined,
        date_from: tempDateFrom || undefined,
        date_to: tempDateTo || undefined,
    });

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/reports/inbound-outbound/export/pdf`, getFilterPayload());
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/reports/inbound-outbound/export/excel`, getFilterPayload());
    };

    const canExport = can('tenant.inbound_outbound.export') || can('inbound_outbound.export');

    return (
        <>
            <Head title="Inbound / Outbound Summary" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Inbound / Outbound Report"
                    description="Real-time transaction flow tracking received goods and outbound fulfillment."
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
                                        <FileText size={15} /> Export PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-emerald-200 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                    >
                                        <FileSpreadsheet size={15} /> Export Excel
                                    </Button>
                                </>
                            )}
                        </div>
                    }
                />

                {/* 4 Stat Cards - Desain seragam */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Received Units</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {summary.total_received_units.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <ArrowDownRight size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Dispatch Units</p>
                            <h3 className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {summary.total_dispatch_units.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/50">
                            <ArrowUpRight size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Open Inbound POs</p>
                            <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {summary.open_inbound_pos}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Open Outbound Orders</p>
                            <h3 className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {summary.open_outbound_pos}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <PackageCheck size={22} />
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
                                <Label className="text-xs font-semibold">Warehouse</Label>
                                <Select value={tempWarehouse} onValueChange={setTempWarehouse}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Warehouse" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Warehouse</SelectItem>
                                        {warehouses?.map((w) => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Category</Label>
                                <Select value={tempCategory} onValueChange={setTempCategory}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Category</SelectItem>
                                        {categories?.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Transaction Status</Label>
                                <Select value={tempStatus} onValueChange={setTempStatus}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="canceled">Canceled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Date From</Label>
                                    <Input
                                        type="date"
                                        value={tempDateFrom}
                                        onChange={(e) => setTempDateFrom(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Date To</Label>
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
                    headers={['DATE', 'TRANSACTION REF', 'FLOW TYPE', 'CONTACT', 'SKU CODE', 'PRODUCT NAME', 'QTY', 'STATUS']}
                    data={reports.data}
                    pagination={reports}
                    renderRow={(item: any) => {
                        const rawType = item.transaction?.transaction_type?.toUpperCase() || 'IN';
                        const isInbound = rawType.includes('IN');
                        const contact = item.transaction?.supplier?.name || item.transaction?.customer?.name || '-';

                        const rawStatus = (item.transaction?.status || 'completed').toLowerCase();
                        let statusBadge = <Badge className="bg-blue-600 text-white hover:bg-blue-700">Completed</Badge>;

                        if (rawStatus === 'pending') {
                            statusBadge = <Badge className="bg-amber-500 text-white hover:bg-amber-600">Pending</Badge>;
                        } else if (rawStatus === 'canceled' || rawStatus === 'cancelled') {
                            statusBadge = <Badge className="bg-rose-600 text-white hover:bg-rose-700">Canceled</Badge>;
                        }

                        return (
                            <>
                                <TableCell className="text-xs text-muted-foreground font-mono">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                                </TableCell>
                                <TableCell className="font-mono text-xs font-semibold">{item.transaction?.local_uuid || '-'}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 font-semibold text-xs ${isInbound ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isInbound ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                                        {isInbound ? 'Inbound' : 'Outbound'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{contact}</TableCell>
                                <TableCell className="font-mono text-xs font-semibold">{item.sku?.sku_code || '-'}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">{item.sku?.product?.name || '-'}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">
                                    {Number(item.quantity || 0).toLocaleString()} <span className="font-normal text-muted-foreground">{item.sku?.unit?.symbol || ''}</span>
                                </TableCell>
                                <TableCell>{statusBadge}</TableCell>
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
        { title: 'Reports', href: '#' },
        { title: 'Inbound / Outbound', href: '#' },
    ],
};
