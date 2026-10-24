import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { debounce } from 'lodash';
import { PageHeader } from '@/components/page-header';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import { ActionButton } from '@/components/action-button';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Layers, Plus, FileText, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import { usePermission } from '@/utils/permission';

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

interface Location {
    id: number;
    rack_code: string;
    zone?: string;
    desc?: string;
    is_active: boolean;
    warehouse?: Warehouse;
    created_at: string;
}

interface LocationIndexProps {
    locations: {
        data: Location[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    warehouses: Warehouse[];
    summary: {
        total_locations: number;
        active_locations: number;
        inactive_locations: number;
    };
    filters: {
        search?: string;
        warehouse_id?: string;
        per_page?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
}

export default function Index({ locations, warehouses, summary, filters }: LocationIndexProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');
    const [tempWarehouseId, setTempWarehouseId] = useState(filters?.warehouse_id || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters?.sort_order as 'asc' | 'desc') || 'desc',
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
            warehouseId: string,
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder,
        ) => {
            router.get(
                `/${tenantSlug}/locations`,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    warehouse_id: warehouseId !== 'all' ? warehouseId : undefined,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        },
        [tenantSlug, sortBy, sortOrder],
    );

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (q: string, p: string, wh: string) => applyFilters(q, p, wh),
                500,
            ),
        [applyFilters],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage, tempWarehouseId);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempWarehouseId);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortOrder(direction);
        applyFilters(
            search,
            perPage,
            tempWarehouseId,
            field,
            direction,
        );
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempWarehouseId);
    };

    const handleResetFilter = () => {
        setTempWarehouseId('all');
        setSortBy('created_at');
        setSortOrder('desc');
        applyFilters(search, perPage, 'all', 'created_at', 'desc');
    };

    const getFilterPayload = () => ({
        search: search || undefined,
        warehouse_id: tempWarehouseId !== 'all' ? tempWarehouseId : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/locations/export/pdf`, getFilterPayload());
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/locations/export/excel`, getFilterPayload());
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus titik lokasi rak ini?')) {
            router.delete(`/${tenantSlug}/locations/${id}`);
        }
    };

    const canShow = can('tenant.locations.show') || can('locations.show');
    const canCreate = can('tenant.locations.create') || can('locations.create');
    const canEdit = can('tenant.locations.edit') || can('locations.edit');
    const canDelete = can('tenant.locations.delete') || can('locations.delete');
    const canExport = can('tenant.locations.export') || can('locations.export');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: 'KODE RAK', sortField: 'rack_code' },
        { label: 'GUDANG', sortField: 'warehouse_name' },
        { label: 'ZONA', sortField: 'zone' },
        'DESKRIPSI',
        { label: 'STATUS', sortField: 'is_active' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title="Rack & Stock Location" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Rack & Stock Location"
                    description="Kelola pemetaan zona dan titik penyimpanan fisik barang (rak, etalase, slot) di seluruh gudang."
                    renderAction={
                        <div className="flex items-center gap-2">
                            {canExport && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPdf}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileText size={15} className="text-red-500" /> Export PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileSpreadsheet size={15} className="text-emerald-500" /> Export Excel
                                    </Button>
                                </>
                            )}
                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href={`/${tenantSlug}/locations/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> Add Location
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* 3 Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Locations</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary?.total_locations ?? locations.total ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Layers size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Active Locations</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary?.active_locations ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Inactive Locations</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary?.inactive_locations ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/50">
                            <XCircle size={22} />
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
                                <Label className="text-xs font-semibold">Gudang</Label>
                                <Select value={tempWarehouseId} onValueChange={setTempWarehouseId}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Warehouses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Warehouses</SelectItem>
                                        {warehouses.map((wh) => (
                                            <SelectItem key={wh.id} value={String(wh.id)}>
                                                {wh.code} - {wh.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                <DataTable
                    headers={tableHeaders}
                    data={locations.data}
                    pagination={locations}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(item: Location) => (
                        <>
                            <TableCell className="font-mono text-xs font-bold text-primary">{item.rack_code}</TableCell>
                            <TableCell className="text-xs font-bold text-foreground">{item.warehouse?.name || '-'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.zone || '-'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.desc || '-'}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        item.is_active
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400'
                                            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400'
                                    }
                                >
                                    {item.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={item.rack_code}
                                    showUrl={`/${tenantSlug}/locations/${item.id}`}
                                    editUrl={`/${tenantSlug}/locations/${item.id}/edit`}
                                    onDelete={() => handleDelete(item.id)}
                                    canShow={canShow}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Rack & Locations', href: '#' },
    ],
};
