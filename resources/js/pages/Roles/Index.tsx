import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { Plus, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import { TableFilter } from '@/components/table-filter';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';

interface Role {
    id: number;
    name: string;
    permissions_count?: number;
}

interface RolesProps {
    roles: {
        data: Array<Role>;
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

export default function Index({ roles, filters }: RolesProps) {
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
                '/roles',
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
        router.delete(`/roles/${id}`, {
            onSuccess: () => toast.success('Role deleted successfully'),
        });
    };

    const handleExportPdf = () => {
        router.post('/roles/export-pdf', { search });
    };

    const handleExportExcel = () => {
        router.post('/roles/export-excel', { search });
    };

    const canCreate = can('central.roles.create');
    const canShow = can('central.roles.show');
    const canEdit = can('central.roles.edit');
    const canDelete = can('central.roles.delete');
    const canExport = can('central.roles.export');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: t("ID"), sortField: 'id' },
        { label: t("Role Name"), sortField: 'name' },
        { label: t("Permissions Count"), sortField: 'permissions_count' },
        'Action',
    ];

    return (
        <>
            <Head title={t("Roles Management")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Role List")}
                    description={t("Manage central system access levels and permissions.")}
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
                                    <Link href="/roles/create">
                                        <Plus className="mr-1.5 h-4 w-4" /> {t("Add Role")}</Link>
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
                    data={roles.data}
                    pagination={roles}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(role) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {t("#")}{role.id}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground capitalize">
                                {role.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                                {role.permissions_count ?? 0} {t("mapped")}</TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={role.name}
                                    showUrl={`/roles/${role.id}`}
                                    editUrl={`/roles/${role.id}/edit`}
                                    onDelete={() => processDelete(role.id)}
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

Index.layout = { breadcrumbs: [{ title: "Roles Management", href: '/roles' }] };
