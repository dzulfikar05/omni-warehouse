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
import { Plus, UserCheck } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
    created_at: string;
}

interface PageProps {
    customers: {
        data: Customer[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string; per_page?: string };
}

export default function CustomerIndex({ customers, filters }: PageProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Tracker untuk cegah toast ganda
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
                `/${tenantSlug}/contacts/customers`,
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
        router.delete(`/${tenantSlug}/contacts/customers/${id}`);
    };

    return (
        <>
            <Head title="Customers Management" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Customers Management"
                    description="Manage customer database, contacts, and transaction profiles."
                    renderAction={
                        <Button asChild className="bg-blue-600 text-white shadow-md hover:bg-blue-700">
                            <Link href={`/${tenantSlug}/contacts/customers/create`}>
                                <Plus className="mr-2 h-4 w-4" /> Add Customer
                            </Link>
                        </Button>
                    }
                />

                {/* Stat Card */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Customers</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{customers.total || 0}</h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <UserCheck size={22} />
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
                    headers={['#', 'CUSTOMER NAME', 'PHONE', 'EMAIL', 'ACTIONS']}
                    data={customers.data}
                    pagination={customers}
                    renderRow={(customer: Customer) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">#{customer.id}</TableCell>
                            <TableCell className="text-xs font-bold text-foreground">{customer.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{customer.phone || '-'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{customer.email || '-'}</TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={customer.name}
                                    showUrl={`/${tenantSlug}/contacts/customers/${customer.id}`}
                                    editUrl={`/${tenantSlug}/contacts/customers/${customer.id}/edit`}
                                    onDelete={() => handleDelete(customer.id)}
                                    canShow={can('customers.show') || true}
                                    canEdit={can('customers.edit') || true}
                                    canDelete={can('customers.delete') || true}
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
        { title: 'Contact', href: '#' },
        { title: 'Customer', href: '#' },
    ],
};
