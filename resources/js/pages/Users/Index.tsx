import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { Plus, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';

import { useTranslation } from '@/context/language-context';
import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/utils/permission';
import { TableFilter } from '@/components/table-filter';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';

type UserWithRoles = User & {
    roles: Array<{ id: number; name: string }>;
};

interface UsersProps {
    users: {
        data: Array<UserWithRoles>;
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        per_page?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
}

export default function Index({ users, filters }: UsersProps) {
    const { t } = useTranslation();
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters.sort_order as 'asc' | 'desc') || 'desc'
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
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            router.get(
                '/users',
                {
                    search: newSearch || undefined,
                    per_page: newPerPage,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [sortBy, sortOrder]
    );

    const debouncedSearch = useMemo(
        () => debounce((q: string, p: string) => applyFilters(q, p), 500),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value);
    };

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortOrder(direction);
        applyFilters(search, perPage, field, direction);
    };

    const processDelete = (id: number) => {
        router.delete(`/users/${id}`, {
            onSuccess: () => toast.success('User deleted successfully'),
        });
    };

    const handleExportPdf = () => {
        router.post('/users/export-pdf', { search });
    };

    const handleExportExcel = () => {
        router.post('/users/export-excel', { search });
    };

    const canCreate = can('central.users.create');
    const canShow = can('central.users.show');
    const canEdit = can('central.users.edit');
    const canDelete = can('central.users.delete');
    const canExport = can('central.users.export');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: "ID", sortField: 'id' },
        { label: "Name", sortField: 'name' },
        { label: "Email", sortField: 'email' },
        'Roles',
        'Action',
    ];

    return (
        <>
            <Head title={t("Central Users Management")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Users List")}
                    description={t("Manage central platform admin users, their credentials, and system roles.")}
                    renderAction={
                        <div className="flex flex-wrap items-center gap-2">
                            {canExport && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPdf}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileText className="h-4 w-4 text-rose-500" /> {t("Export PDF")}</Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> {t("Export Excel")}</Button>
                                </>
                            )}
                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href="/users/create">
                                        <Plus className="mr-1.5 h-4 w-4" /> {t("Add User")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                >
                    <TableFilter
                        search={search}
                        onSearchChange={onSearchChange}
                        perPage={perPage}
                        onPerPageChange={onPerPageChange}
                    />
                </PageHeader>

                <DataTable
                    headers={tableHeaders}
                    data={users.data}
                    pagination={users}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(user) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {t("#")}{user.id}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground">
                                {user.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {user.email}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant="outline"
                                                className="border-blue-200 bg-blue-50 font-medium text-blue-700 capitalize dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                                            >
                                                {role.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs italic text-muted-foreground">
                                            {t("No Role")}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={user.name}
                                    showUrl={`/users/${user.id}`}
                                    editUrl={`/users/${user.id}/edit`}
                                    onDelete={() => processDelete(user.id)}
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

Index.layout = { breadcrumbs: [{ title: "Users Management", href: '/users' }] };
