import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { usePermission } from '@/utils/permission';
import {
    Plus,
    Ruler,
    FileText,
    FileSpreadsheet,
    Tag,
    Scale,
} from 'lucide-react';

export interface UnitItem {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
}

interface UnitStats {
    total_units?: number;
    short_symbols?: number;
    custom_symbols?: number;
}

interface IndexProps {
    units: {
        data: UnitItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: UnitStats;
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        per_page?: string;
    };
}

export default function UnitIndex({ units, stats, filters }: IndexProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters?.sort_order as 'asc' | 'desc') || 'desc'
    );
    const [perPage, setPerPage] = useState(filters?.per_page || '10');

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
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            router.get(
                `/${tenantSlug}/inventory/units`,
                {
                    search: newSearch || undefined,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                    per_page: newPerPage,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [tenantSlug, sortBy, sortOrder]
    );

    const debouncedSearch = useMemo(
        () => debounce((q: string, p: string) => applyFilters(q, p), 500),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortOrder(direction);
        applyFilters(search, perPage, field, direction);
    };

    const handleDelete = (id: number) => {
        router.delete(`/${tenantSlug}/inventory/units/${id}`);
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/inventory/units/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/inventory/units/export/excel`);
    };

    const totalUnits = stats?.total_units ?? units.total ?? 0;
    const shortSymbols = stats?.short_symbols ?? 0;
    const customSymbols = stats?.custom_symbols ?? 0;

    const canExport = can('tenant.units.export') || can('units.export');
    const canCreate = can('tenant.units.create') || can('units.create');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: 'UNIT ID', sortField: 'id' },
        { label: 'UNIT NAME', sortField: 'name' },
        { label: 'SYMBOL', sortField: 'symbol' },
        { label: 'DATE ADDED', sortField: 'created_at' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title="Units of Measurement" />

            <div className="space-y-6 p-4 font-sans sm:p-6">
                <PageHeader
                    title="Measurement Units"
                    description="Manage standard inventory quantities and measurement notation."
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
                                    <Link href={`/${tenantSlug}/inventory/units/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> Add Unit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Units</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalUnits}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">Standard Definitions</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Ruler size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Standard Notation</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{shortSymbols}</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">≤ 3 Characters</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <Tag size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Custom Notation</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{customSymbols}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">&gt; 3 Characters</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50">
                            <Scale size={22} />
                        </div>
                    </div>
                </div>

                {/* Table Filter Component */}
                <TableFilter
                    search={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        debouncedSearch(e.target.value, perPage);
                    }}
                    perPage={perPage}
                    onPerPageChange={(val) => {
                        setPerPage(val);
                        applyFilters(search, val);
                    }}
                />

                {/* Data Table Component */}
                <DataTable
                    headers={tableHeaders}
                    data={units.data}
                    pagination={units}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(unit: UnitItem) => (
                        <>
                            <TableCell className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                UNIT-00{unit.id}
                            </TableCell>

                            <TableCell className="text-xs font-bold text-foreground">
                                {unit.name}
                            </TableCell>

                            <TableCell className="font-mono text-xs">
                                <span className="rounded-lg bg-muted px-2.5 py-0.5 font-bold text-foreground">
                                    {unit.symbol}
                                </span>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {new Date(unit.created_at).toLocaleDateString('en-GB')}
                            </TableCell>

                            <TableCell className="text-right">
                                <ActionButton
                                    label={unit.name}
                                    showUrl={`/${tenantSlug}/inventory/units/${unit.id}`}
                                    editUrl={`/${tenantSlug}/inventory/units/${unit.id}/edit`}
                                    onDelete={() => handleDelete(unit.id)}
                                    canShow={can('tenant.units.show') || can('units.show')}
                                    canEdit={can('tenant.units.edit') || can('units.edit')}
                                    canDelete={can('tenant.units.delete') || can('units.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

UnitIndex.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '#' },
        { title: 'Units', href: '#' },
    ],
};
