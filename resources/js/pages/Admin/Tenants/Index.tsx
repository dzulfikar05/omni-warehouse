import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { TableFilter } from '@/components/table-filter';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';
import { FilterDropdown } from '@/components/table-dropdown';
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
    CheckCircle2,
    XCircle,
    CalendarCheck,
    FileText,
    FileSpreadsheet,
    Building,
} from 'lucide-react';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    email?: string;
    website?: string;
    tax_number?: string;
    address?: string;
    logo_url?: string;
    users_count?: number;
    created_at: string;
    subscription?: {
        status: string;
        plan?: {
            id: number;
            name: string;
        };
    };
}

interface Plan {
    id: number;
    name: string;
}

interface TenantStats {
    total_tenants?: number;
    active_tenants?: number;
    inactive_tenants?: number;
    new_this_month?: number;
}

interface PageProps {
    tenants: {
        data: Tenant[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: TenantStats;
    plans: Plan[];
    filters: {
        search?: string;
        per_page?: string;
        status?: string;
        plan_id?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
}

export default function TenantIndex({ tenants, stats, plans, filters }: PageProps) {
    const { flash } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');

    // Filter States
    const [tempStatus, setTempStatus] = useState(filters?.status || 'all');
    const [tempPlan, setTempPlan] = useState(filters?.plan_id || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters?.sort_order as 'asc' | 'desc') || 'desc'
    );

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
            status: string = tempStatus,
            plan: string = tempPlan,
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            // PERBAIKAN: Menyesuaikan URL dengan route /tenants
            router.get(
                '/tenants',
                {
                    search: newSearch || undefined,
                    per_page: newPerPage,
                    status: status !== 'all' ? status : undefined,
                    plan_id: plan !== 'all' ? plan : undefined,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [tempStatus, tempPlan, sortBy, sortOrder]
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
        applyFilters(search, perPage, tempStatus, tempPlan, field, direction);
    };

    const handleDelete = (id: number) => {
        // PERBAIKAN: Menyesuaikan URL delete ke /tenants/{id}
        router.delete(`/tenants/${id}`);
    };

    const handleExportPdf = () => {
        // PERBAIKAN: Menyesuaikan URL export PDF sesuai route /tenants/tenants/export/pdf
        router.get('/tenants/tenants/export/pdf');
    };

    const handleExportExcel = () => {
        // PERBAIKAN: Menyesuaikan URL export Excel sesuai route /tenants/tenants/export/excel
        router.get('/tenants/tenants/export/excel');
    };

    const handleApplyDropdownFilter = () => {
        applyFilters(search, perPage, tempStatus, tempPlan, sortBy, sortOrder);
    };

    const handleResetDropdownFilter = () => {
        setTempStatus('all');
        setTempPlan('all');
        setSortBy('created_at');
        setSortOrder('desc');
        applyFilters(search, perPage, 'all', 'all', 'created_at', 'desc');
    };

    const canView = can('central.tenants.view');
    const canCreate = can('central.tenants.create');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: '#', sortField: 'id' },
        { label: 'TENANT NAME', sortField: 'name' },
        'PLAN TIER',
        'PHONE / EMAIL',
        { label: 'TAX ID / NPWP', sortField: 'tax_number' },
        { label: 'STATUS', sortField: 'status' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title="Tenants Management" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Tenants Management"
                    description="Manage registered organization tenants, subscriptions, and system resource limits."
                    renderAction={
                        <div className="flex items-center gap-2">
                            {canView && (
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
                                    {/* PERBAIKAN: URL Create ke /tenants/create */}
                                    <Link href="/tenants/create">
                                        <Plus className="mr-1.5 h-4 w-4" /> Add Tenant
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Tenants</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {stats?.total_tenants ?? tenants.total ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Building size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Active Subscriptions</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats?.active_tenants ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Inactive Tenants</p>
                            <h3 className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {stats?.inactive_tenants ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/50">
                            <XCircle size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">New This Month</p>
                            <h3 className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                +{stats?.new_this_month ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50">
                            <CalendarCheck size={22} />
                        </div>
                    </div>
                </div>

                {/* Table Filters */}
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
                >
                    <FilterDropdown onApply={handleApplyDropdownFilter} onReset={handleResetDropdownFilter}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider">Tenant Status</Label>
                                <Select value={tempStatus} onValueChange={setTempStatus}>
                                    <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider">Plan Tier</Label>
                                <Select value={tempPlan} onValueChange={setTempPlan}>
                                    <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="All Plans" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Plans</SelectItem>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                {/* Data Table */}
                <DataTable
                    headers={tableHeaders}
                    data={tenants.data}
                    pagination={tenants}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(tenant: Tenant) => {
                        const isActive = tenant.subscription?.status === 'active';
                        return (
                            <>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{tenant.id}
                                </TableCell>
                                <TableCell className="text-xs">
                                    <div className="font-bold text-foreground">{tenant.name}</div>
                                    <div className="text-[11px] text-muted-foreground">/{tenant.slug}</div>
                                </TableCell>
                                <TableCell className="text-xs">
                                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
                                        {tenant.subscription?.plan?.name || 'Standard Plan'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    <div>{tenant.phone || '-'}</div>
                                    <div className="text-[11px] text-muted-foreground">{tenant.email || '-'}</div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {tenant.tax_number || '-'}
                                </TableCell>
                                <TableCell className="text-xs">
                                    <span
                                        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                                            isActive
                                                ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                        }`}
                                    >
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* PERBAIKAN: URL Show & Edit ke /tenants/... */}
                                    <ActionButton
                                        label={tenant.name}
                                        showUrl={`/tenants/${tenant.id}`}
                                        editUrl={`/tenants/${tenant.id}/edit`}
                                        onDelete={() => handleDelete(tenant.id)}
                                        canShow={can('central.tenants.view')}
                                        canEdit={can('central.tenants.edit')}
                                        canDelete={can('central.tenants.delete')}
                                    />
                                </TableCell>
                            </>
                        );
                    }}
                />
            </div>
        </>
    );
}

TenantIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Tenants Management', href: '/tenants' },
    ],
};
