import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { TableFilter } from '@/components/table-filter';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import { Plus, UserCheck, UserPlus, PhoneCall, FileText, FileSpreadsheet } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    notes?: string;
    created_at: string;
}

interface CustomerStats {
    total_customers?: number;
    new_this_month?: number;
    has_contact?: number;
}

interface PageProps {
    customers: {
        data: Customer[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: CustomerStats;
    filters: {
        search?: string;
        per_page?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
}

export default function CustomerIndex({ customers, stats, filters }: PageProps) {
    const { t } = useTranslation();
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters?.sort_order as 'asc' | 'desc') || 'desc'
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
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            router.get(
                `/${tenantSlug}/contacts/customers`,
                {
                    search: newSearch || undefined,
                    per_page: newPerPage,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
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
        router.delete(`/${tenantSlug}/contacts/customers/${id}`);
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/contacts/customers/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/contacts/customers/export/excel`);
    };

    const canExport = can('tenant.contacts.customers.export') || can('customers.export');
    const canCreate = can('tenant.contacts.customers.create') || can('customers.create');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: t("#"), sortField: 'id' },
        { label: t("CUSTOMER NAME"), sortField: 'name' },
        { label: t("PHONE"), sortField: 'phone' },
        { label: t("EMAIL"), sortField: 'email' },
        { label: t("TAX ID / NPWP"), sortField: 'tax_number' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title={t("Customers Management")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Customers Management")}
                    description={t("Manage customer database, contacts, and transaction profiles.")}
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
                                    <Link href={`/${tenantSlug}/contacts/customers/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> {t("Add Customer")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Customers")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {stats?.total_customers ?? customers.total ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <UserCheck size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("New This Month")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {stats?.new_this_month ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50">
                            <UserPlus size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("With Contact Info")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {stats?.has_contact ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <PhoneCall size={22} />
                        </div>
                    </div>
                </div>

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

                <DataTable
                    headers={tableHeaders}
                    data={customers.data}
                    pagination={customers}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(customer: Customer) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">{t("#")}{customer.id}</TableCell>
                            <TableCell className="text-xs font-bold text-foreground">{customer.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{customer.phone || '-'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{customer.email || '-'}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{customer.tax_number || '-'}</TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={customer.name}
                                    showUrl={`/${tenantSlug}/contacts/customers/${customer.id}`}
                                    editUrl={`/${tenantSlug}/contacts/customers/${customer.id}/edit`}
                                    onDelete={() => handleDelete(customer.id)}
                                    canShow={can('tenant.contacts.customers.show') || can('customers.show')}
                                    canEdit={can('tenant.contacts.customers.edit') || can('customers.edit')}
                                    canDelete={can('tenant.contacts.customers.delete') || can('customers.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

CustomerIndex.layout = {
    breadcrumbs: [
        { title: "Contact", href: '#' },
        { title: "Customer", href: '#' },
    ],
};
