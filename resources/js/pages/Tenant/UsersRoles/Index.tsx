import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell } from '@/components/ui/table';
import { DataTable } from '@/components/data-table';
import { TableFilter } from '@/components/table-filter';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { usePermission } from '@/utils/permission';
import { Users, Shield, Plus } from 'lucide-react';

interface MemberUser {
    id: number;
    name: string;
    email: string;
    initials?: string;
    role?: string;
    status?: string;
    last_login_at?: string;
    ip_address?: string;
}

interface RoleItem {
    id: number;
    name: string;
    permissions_count?: number;
}

interface PageProps {
    users: {
        data: MemberUser[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    roles: {
        data: RoleItem[];
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
        tab?: string;
        role_filter?: string;
    };
}

export default function Index({ users, roles, filters }: PageProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [activeTab, setActiveTab] = useState<'users' | 'roles'>(
        (filters?.tab as 'users' | 'roles') || 'users',
    );
    const [search, setSearch] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(
        filters?.role_filter || 'all',
    );

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Tracker untuk mencegah toast ganda
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
            tab: string,
            roleFilter: string,
        ) => {
            router.get(
                `/${tenantSlug}/settings/users-roles`,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    tab,
                    role_filter: roleFilter,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        },
        [tenantSlug],
    );

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (q: string, p: string, t: string, r: string) =>
                    applyFilters(q, p, t, r),
                500,
            ),
        [applyFilters],
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage, activeTab, selectedRoleFilter);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, activeTab, selectedRoleFilter);
    };

    const handleTabChange = (tab: 'users' | 'roles') => {
        setActiveTab(tab);
        applyFilters(search, perPage, tab, selectedRoleFilter);
    };

    const handleRoleBadgeFilter = (roleName: string) => {
        setSelectedRoleFilter(roleName);
        applyFilters(search, perPage, activeTab, roleName);
    };

    // Handler Hapus User
    const processDeleteUser = (id: number) => {
        router.delete(`/${tenantSlug}/settings/users/${id}`);
    };

    // Handler Hapus Role
    const processDeleteRole = (id: number) => {
        router.delete(`/${tenantSlug}/settings/roles/${id}`);
    };

    return (
        <>
            <Head title="Team & Access Control" />

            <div className="space-y-6 p-4">
                <PageHeader
                    title="Team & Access Control"
                    description="Manage organization members, Spatie RBAC roles, and operational module permissions."
                    renderAction={
                        <Button
                            asChild
                            className="bg-blue-600 text-white shadow-md hover:bg-blue-700"
                        >
                            <Link
                                href={
                                    activeTab === 'users'
                                        ? `/${tenantSlug ? tenantSlug + '/' : ''}settings/users/create`
                                        : `/${tenantSlug ? tenantSlug + '/' : ''}settings/roles/create`
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {activeTab === 'users'
                                    ? 'Add Member'
                                    : 'Add Role'}
                            </Link>
                        </Button>
                    }
                >
                    <div className="space-y-4 mt-12">
                        <div className="flex items-center gap-6 border-b border-border pt-2">
                            <button
                                type="button"
                                onClick={() => handleTabChange('users')}
                                className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-semibold transition-all ${
                                    activeTab === 'users'
                                        ? 'border-blue-600 font-bold text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Users className="h-4 w-4" />
                                Team Members ({users?.total || 0})
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTabChange('roles')}
                                className={`flex items-center gap-2 border-b-2 pb-3 text-xs font-semibold transition-all ${
                                    activeTab === 'roles'
                                        ? 'border-blue-600 font-bold text-blue-600'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Shield className="h-4 w-4" />
                                Roles & Permissions (Spatie RBAC)
                            </button>
                        </div>

                        <TableFilter
                            search={search}
                            onSearchChange={onSearchChange}
                            perPage={perPage}
                            onPerPageChange={onPerPageChange}
                        />

                        {activeTab === 'users' && roles?.data && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleRoleBadgeFilter('all')}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                        selectedRoleFilter === 'all'
                                            ? 'bg-foreground text-background'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    All ({users?.total || 0})
                                </button>
                                {roles.data.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() =>
                                            handleRoleBadgeFilter(r.name)
                                        }
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                            selectedRoleFilter === r.name
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </PageHeader>

                {/* TAB 1: USERS TABLE */}
                {activeTab === 'users' && (
                    <DataTable
                        headers={[
                            '#',
                            'USER',
                            'ROLE',
                            'STATUS',
                            'LAST LOGIN',
                            'ACTIONS',
                        ]}
                        data={users.data}
                        pagination={users}
                        renderRow={(user: MemberUser) => (
                            <>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{user.id}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                            {user.initials ||
                                                user.name
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-foreground">
                                                {user.name}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className="border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                                    >
                                        {user.role || 'Member'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            user.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                user.status === 'Active'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-amber-500'
                                            }`}
                                        />
                                        {user.status || 'Active'}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="text-xs font-medium text-foreground">
                                        {user.last_login_at ||
                                            'Never logged in'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {user.ip_address || '-'}
                                    </div>
                                </TableCell>

                                {/* ACTION BUTTON USER */}
                                <TableCell className="text-right">
                                    <ActionButton
                                        label={user.name}
                                        showUrl={`/${tenantSlug}/settings/users/${user.id}`}
                                        editUrl={`/${tenantSlug}/settings/users/${user.id}/edit`}
                                        onDelete={() => processDeleteUser(user.id)}
                                        canShow={can('users.show') || true}
                                        canEdit={can('users.edit') || true}
                                        canDelete={can('users.delete') || true}
                                    />
                                </TableCell>
                            </>
                        )}
                    />
                )}

                {/* TAB 2: ROLES TABLE */}
                {activeTab === 'roles' && (
                    <DataTable
                        headers={[
                            '#',
                            'ROLE NAME',
                            'ATTACHED PERMISSIONS',
                            'ACTIONS',
                        ]}
                        data={roles.data}
                        pagination={roles}
                        renderRow={(role: RoleItem) => (
                            <>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{role.id}
                                </TableCell>

                                <TableCell className="text-xs font-bold text-foreground">
                                    {role.name}
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {role.permissions_count || 0}{' '}
                                        Permissions
                                    </Badge>
                                </TableCell>

                                {/* ACTION BUTTON ROLE */}
                                <TableCell className="text-right">
                                    <ActionButton
                                        label={role.name}
                                        showUrl={`/${tenantSlug}/settings/roles/${role.id}`}
                                        editUrl={`/${tenantSlug}/settings/roles/${role.id}/edit`}
                                        onDelete={() => processDeleteRole(role.id)}
                                        canShow={can('roles.show') || true}
                                        canEdit={can('roles.edit') || true}
                                        canDelete={can('roles.delete') || true}
                                    />
                                </TableCell>
                            </>
                        )}
                    />
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
    ],
};
