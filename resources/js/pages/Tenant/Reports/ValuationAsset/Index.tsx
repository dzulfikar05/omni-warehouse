import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { TableCell } from '@/components/ui/table';
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
import { DollarSign, Boxes, ShoppingCart, Calculator, FileText, FileSpreadsheet } from 'lucide-react';
import { usePermission } from '@/utils/permission';

interface Warehouse {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface ValuationAssetProps {
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
        total_asset_value: number;
        total_skus: number;
        total_quantity: number;
        avg_unit_cost: number;
    };
    warehouses: Warehouse[];
    categories: Category[];
    filters: {
        search?: string;
        per_page?: string;
        warehouse_id?: string;
        category_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ reports, summary, warehouses, categories, filters }: ValuationAssetProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [tempWarehouse, setTempWarehouse] = useState(filters.warehouse_id || 'all');
    const [tempCategory, setTempCategory] = useState(filters.category_id || 'all');
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

    const formatRp = (val: number) => {
        if (!val || isNaN(val)) return 'Rp 0';
        if (val >= 1_000_000_000) {
            return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
        }
        if (val >= 1_000_000) {
            return `Rp ${(val / 1_000_000).toFixed(2)} Jt`;
        }
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    const applyFilters = useCallback(
        (
            newSearch: string,
            newPerPage: string,
            warehouse: string,
            category: string,
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
                (q: string, p: string, w: string, c: string, df: string, dt: string) =>
                    applyFilters(q, p, w, c, df, dt),
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
        debouncedSearch(value, perPage, tempWarehouse, tempCategory, tempDateFrom, tempDateTo);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempWarehouse, tempCategory, tempDateFrom, tempDateTo);
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempWarehouse, tempCategory, tempDateFrom, tempDateTo);
    };

    const handleResetFilter = () => {
        setTempWarehouse('all');
        setTempCategory('all');
        setTempDateFrom('');
        setTempDateTo('');
        applyFilters(search, perPage, 'all', 'all', '', '');
    };

    const getFilterPayload = () => ({
        search: search || undefined,
        warehouse_id: tempWarehouse !== 'all' ? tempWarehouse : undefined,
        category_id: tempCategory !== 'all' ? tempCategory : undefined,
        date_from: tempDateFrom || undefined,
        date_to: tempDateTo || undefined,
    });

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/reports/valuation-asset/export/pdf`, getFilterPayload());
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/reports/valuation-asset/export/excel`, getFilterPayload());
    };

    const canExport = can('tenant.valuation_asset.export') || can('valuation_asset.export');

    return (
        <>
            <Head title="Valuation & Asset Report" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Valuation & Asset Report"
                    description="Financial valuation of inventory stocks categorized by location and item base costs."
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
                            <p className="text-xs font-medium text-muted-foreground">Total Asset Value</p>
                            <h3 className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRp(summary.total_asset_value)}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <DollarSign size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Active SKUs</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary.total_skus.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Boxes size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Units On Hand</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary.total_quantity.toLocaleString()}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50">
                            <ShoppingCart size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Average Unit Cost</p>
                            <h3 className="mt-1 text-xl font-bold text-foreground">
                                {formatRp(summary.avg_unit_cost)}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50">
                            <Calculator size={22} />
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

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Updated From</Label>
                                    <Input
                                        type="date"
                                        value={tempDateFrom}
                                        onChange={(e) => setTempDateFrom(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Updated To</Label>
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
                    headers={['SKU CODE', 'PRODUCT NAME', 'LOCATION', 'CATEGORY', 'QTY ON HAND', 'BASE COST / UNIT', 'TOTAL ASSET VALUE']}
                    data={reports.data}
                    pagination={reports}
                    renderRow={(item: any) => {
                        const cost = Number(item.sku?.base_cost || 0);
                        const qty = Number(item.quantity || 0);
                        const totalValue = qty * cost;

                        return (
                            <>
                                <TableCell className="font-mono text-xs font-semibold">{item.sku?.sku_code || '-'}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">{item.sku?.product?.name || '-'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.location?.warehouse?.name || '-'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.sku?.product?.category?.name || '-'}</TableCell>
                                <TableCell className="text-xs font-bold text-foreground">
                                    {qty.toLocaleString()} <span className="font-normal text-muted-foreground">{item.sku?.unit?.symbol || ''}</span>
                                </TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">{formatRp(cost)}</TableCell>
                                <TableCell className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatRp(totalValue)}
                                </TableCell>
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
        { title: 'Valuation & Asset', href: '#' },
    ],
};
