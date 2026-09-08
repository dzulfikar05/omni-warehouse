import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { LucideEye, Pencil, Trash, Plus } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { debounce } from 'lodash';

import { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/utils/permission';
import { TableFilter } from '@/components/table-filter';
import { DataTable } from '@/components/data-table';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';

// Definisikan tipe User dengan relasi roles
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

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
    }, [flash.success]);

    const applyFilters = useCallback(
        (newSearch: string, newPerPage: string) => {
            router.get(
                '/users',
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
        router.delete(`/users/${id}`, {
            onSuccess: () => toast.success('User deleted successfully'),
        });
    };

    return (
        <>
            <Head title="Users Management" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                <PageHeader
                    title="User List"
                    description="Manage registered users, their account details, and assigned roles."
                    renderAction={
                        <Button asChild className="shadow-md">
                            <Link href="/users/create">
                                <Plus className="mr-2 h-4 w-4" /> Add User
                            </Link>
                        </Button>
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
                                    {user.roles.length > 0 ? (
                                        user.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant="outline"
                                                className="border-primary/20 bg-primary/10 font-medium text-primary capitalize"
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
                                    canShow={can('users.show')}
                                    canEdit={can('users.edit')}
                                    canDelete={can('users.delete')}
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
