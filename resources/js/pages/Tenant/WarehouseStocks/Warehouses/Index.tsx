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
import { Warehouse as WarehouseIcon, Plus, FileText, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';

interface Warehouse {
    id: number;
    code: string;
    name: string;
    desc?: string;
    is_active: boolean;
    created_at: string;
}

interface WarehouseIndexProps {
    warehouses: {
        data: Warehouse[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    summary: {
        total_warehouses: number;
        active_warehouses: number;
        inactive_warehouses: number;
    };
    filters: {
        search?: string;
        per_page?: string;
        is_active?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
}

export default function Index({ warehouses, summary, filters }: WarehouseIndexProps) {
    const { t } = useTranslation();
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');
    const [tempIsActive, setTempIsActive] = useState(filters?.is_active || 'all');
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
            isActive: string,
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder,
        ) => {
            router.get(
                `/${tenantSlug}/warehouses`,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    is_active: isActive !== 'all' ? isActive : undefined,
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
                (q: string, p: string, act: string) => applyFilters(q, p, act),
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
        debouncedSearch(value, perPage, tempIsActive);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempIsActive);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortOrder(direction);
        applyFilters(
            search,
            perPage,
            tempIsActive,
            field,
            direction,
        );
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempIsActive);
    };

    const handleResetFilter = () => {
        setTempIsActive('all');
        setSortBy('created_at');
        setSortOrder('desc');
        applyFilters(search, perPage, 'all', 'created_at', 'desc');
    };

    const getFilterPayload = () => ({
        search: search || undefined,
        is_active: tempIsActive !== 'all' ? tempIsActive : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/warehouses/export/pdf`, getFilterPayload());
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/warehouses/export/excel`, getFilterPayload());
    };

    const handleDelete = (id: number) => {
        router.delete(`/${tenantSlug}/warehouses/${id}`);
    };

    const canShow = can('tenant.warehouses.show') || can('warehouses.show');
    const canCreate = can('tenant.warehouses.create') || can('warehouses.create');
    const canEdit = can('tenant.warehouses.edit') || can('warehouses.edit');
    const canDelete = can('tenant.warehouses.delete') || can('warehouses.delete');
    const canExport = can('tenant.warehouses.export') || can('warehouses.export');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: t("KODE GUDANG"), sortField: 'code' },
        { label: t("NAMA WAREHOUSE"), sortField: 'name' },
        'ALAMAT / DESKRIPSI',
        { label: t("TANGGAL DIBUAT"), sortField: 'created_at' },
        { label: t("STATUS"), sortField: 'is_active' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title={t("Warehouse Management")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Warehouse Management")}
                    description={t("Kelola data master gudang, lokasi penyimpanan fisik, serta fasilitas penampungan stok.")}
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
                                        <FileText size={15} className="text-red-500" /> {t("Export PDF")}</Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileSpreadsheet size={15} className="text-emerald-500" /> {t("Export Excel")}</Button>
                                </>
                            )}
                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href={`/${tenantSlug}/warehouses/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> {t("Add Warehouse")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* 3 Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Warehouses")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary?.total_warehouses ?? warehouses.total ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <WarehouseIcon size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Active Warehouses")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary?.active_warehouses ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Inactive Warehouses")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {summary?.inactive_warehouses ?? 0}
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
                                <Label className="text-xs font-semibold">{t("Status Operasional")}</Label>
                                <Select value={tempIsActive} onValueChange={setTempIsActive}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("All Status")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("All Status")}</SelectItem>
                                        <SelectItem value="1">{t("Active")}</SelectItem>
                                        <SelectItem value="0">{t("Inactive")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                <DataTable
                    headers={tableHeaders}
                    data={warehouses.data}
                    pagination={warehouses}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(item: Warehouse) => (
                        <>
                            <TableCell className="font-mono text-xs font-bold text-primary">{item.code}</TableCell>
                            <TableCell className="text-xs font-bold text-foreground">{item.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.desc || '-'}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        item.is_active
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400'
                                            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400'
                                    }
                                >
                                    {item.is_active ? t("Active") : t("Inactive")}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={item.name}
                                    showUrl={`/${tenantSlug}/warehouses/${item.id}`}
                                    editUrl={`/${tenantSlug}/warehouses/${item.id}/edit`}
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
        { title: "Warehouse & Stocks", href: '#' },
        { title: "Warehouses", href: '#' },
    ],
};
