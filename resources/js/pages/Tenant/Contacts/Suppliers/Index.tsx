import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { DataTable } from '@/components/data-table';
import { TableFilter } from '@/components/table-filter';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { usePermission } from '@/utils/permission';
import { Plus, Truck, UserPlus, PhoneCall, FileText, FileSpreadsheet } from 'lucide-react';

interface Supplier {
    id: number;
    name: string;
    pic?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    address?: string;
    notes?: string;
    created_at: string;
}

interface SupplierStats {
    total_suppliers?: number;
    new_this_month?: number;
    has_contact?: number;
}

interface PageProps {
    suppliers: {
        data: Supplier[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: SupplierStats;
    filters: { search?: string; per_page?: string };
}

export default function SupplierIndex({ suppliers, stats, filters }: PageProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
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
        (newSearch: string, newPerPage: string) => {
            router.get(
                `/${tenantSlug}/contacts/suppliers`,
                { search: newSearch, per_page: newPerPage },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        },
        [tenantSlug],
    );

    const debouncedSearch = useMemo(
        () => debounce((q: string, p: string) => applyFilters(q, p), 500),
        [applyFilters],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleDelete = (id: number) => {
        router.delete(`/${tenantSlug}/contacts/suppliers/${id}`);
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/contacts/suppliers/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/contacts/suppliers/export/excel`);
    };

    const canExport = can('tenant.contacts.suppliers.export') || can('suppliers.export');
    const canCreate = can('tenant.contacts.suppliers.create') || can('suppliers.create');

    return (
        <>
            <Head title="Suppliers Management" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Suppliers Management"
                    description="Manage supplier list and vendor contacts."
                    renderAction={
                        <div className="flex items-center gap-2">
                            {canExport && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        onClick={handleExportPdf}
                                    >
                                        <FileText size={15} /> Export PDF
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                        onClick={handleExportExcel}
                                    >
                                        <FileSpreadsheet size={15} /> Export Excel
                                    </Button>
                                </>
                            )}

                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href={`/${tenantSlug}/contacts/suppliers/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> Add Supplier
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Suppliers</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {stats?.total_suppliers ?? suppliers.total ?? 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Truck size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">New This Month</p>
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
                            <p className="text-xs font-medium text-muted-foreground">With Contact Info</p>
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
                    headers={['#', 'SUPPLIER NAME', 'PIC', 'CONTACT INFO', 'TAX ID', 'ACTIONS']}
                    data={suppliers.data}
                    pagination={suppliers}
                    renderRow={(supplier: Supplier) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">#{supplier.id}</TableCell>
                            <TableCell className="text-xs font-bold text-foreground">{supplier.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{supplier.pic || '-'}</TableCell>
                            <TableCell>
                                <div className="text-xs font-medium text-foreground">{supplier.phone || '-'}</div>
                                <div className="text-[11px] text-muted-foreground">{supplier.email || '-'}</div>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">{supplier.tax_number || '-'}</TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={supplier.name}
                                    showUrl={`/${tenantSlug}/contacts/suppliers/${supplier.id}`}
                                    editUrl={`/${tenantSlug}/contacts/suppliers/${supplier.id}/edit`}
                                    onDelete={() => handleDelete(supplier.id)}
                                    canShow={can('tenant.contacts.suppliers.show') || can('suppliers.show')}
                                    canEdit={can('tenant.contacts.suppliers.edit') || can('suppliers.edit')}
                                    canDelete={can('tenant.contacts.suppliers.delete') || can('suppliers.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

SupplierIndex.layout = {
    breadcrumbs: [
        { title: 'Contact', href: '#' },
        { title: 'Supplier', href: '#' },
    ],
};
