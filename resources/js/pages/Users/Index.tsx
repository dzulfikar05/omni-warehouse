import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { Plus, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';

import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/utils/permission';
import { TableFilter } from '@/components/table-filter';
import { DataTable } from '@/components/data-table';
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
    filters: { search?: string; per_page?: string };
}

export default function Index({ users, filters }: UsersProps) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

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
                '/users',
                { search: newSearch, per_page: newPerPage },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        []
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

    return (
        <>
            <Head title="Central Users Management" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Central Users List"
                    description="Manage central platform admin users, their credentials, and system roles."
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
                                        <FileText className="h-4 w-4 text-rose-500" /> Export PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export Excel
                                    </Button>
                                </>
                            )}
                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href="/users/create">
                                        <Plus className="mr-1.5 h-4 w-4" /> Add User
                                    </Link>
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
                    headers={['ID', 'Name', 'Email', 'Roles', 'Action']}
                    data={users.data}
                    pagination={users}
                    renderRow={(user) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                #{user.id}
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
                                                className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 font-medium capitalize"
                                            >
                                                {role.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">
                                            No Role
                                        </span>
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

Index.layout = { breadcrumbs: [{ title: 'Users Management', href: '/users' }] };
