import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { usePermission } from '@/utils/permission';
import { TableFilter } from '@/components/table-filter';
import { DataTable } from '@/components/data-table';
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

interface Role {
    id: number;
    name: string;
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
    filters: { search?: string; per_page?: string; status?: any };
}

export default function Index({ roles, filters }: RolesProps) {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
    }, [flash.success]);

    const applyFilters = useCallback(
        (newSearch: string, newPerPage: string) => {
            router.get(
                '/roles',
                { search: newSearch, per_page: newPerPage },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        },
        [],
    );

    const debouncedSearch = useMemo(
        () => debounce((q: string, p: string) => applyFilters(q, p), 500),
        [applyFilters],
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
        router.delete(`/roles/${id}`, {
            onSuccess: () => toast.success('Role deleted successfully'),
        });
    };

    const [tempStatus, setTempStatus] = useState(filters.status || 'all');
    const handleApplyFilter = () => {
        router.get(
            '/roles',
            {
                search,
                per_page: perPage,
                status: tempStatus,
            },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Roles Management" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                <PageHeader
                    title="Role List"
                    description="Manage system access levels and permissions."
                    renderAction={
                        can('roles.create') && (
                            <Button
                                asChild
                                className="shadow-md"
                            >
                                <Link href="/roles/create">
                                    <Plus className="mr-2 h-4 w-4" /> Add Role
                                </Link>
                            </Button>
                        )
                    }
                >
                    <TableFilter
                        search={search}
                        onSearchChange={onSearchChange}
                        perPage={perPage}
                        onPerPageChange={onPerPageChange}
                    >
                        <FilterDropdown
                            onApply={handleApplyFilter}
                            onReset={() => setTempStatus('all')}
                        >
                            <div className="space-y-2">
                                <Label className="text-xs">Status</Label>
                                <Select
                                    value={tempStatus}
                                    onValueChange={setTempStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </FilterDropdown>
                    </TableFilter>
                </PageHeader>

                <DataTable
                    headers={['#', 'Role Name', '']}
                    data={roles.data}
                    pagination={roles}
                    renderRow={(role) => (
                        <>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                #{role.id}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {role.name}
                            </TableCell>
                            <TableCell className="text-right">
                                <ActionButton
                                    label={role.name}
                                    showUrl={`/roles/${role.id}`}
                                    editUrl={`/roles/${role.id}/edit`}
                                    onDelete={() => processDelete(role.id)}
                                    canShow={can('roles.show')}
                                    canEdit={can('roles.edit')}
                                    canDelete={can('roles.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

Index.layout = { breadcrumbs: [{ title: 'Roles', href: '/roles' }] };
