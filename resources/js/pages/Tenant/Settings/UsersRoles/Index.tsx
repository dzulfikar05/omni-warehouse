import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { TableFilter } from '@/components/table-filter';
import { DataTable } from '@/components/data-table';
import { ActionButton } from '@/components/action-button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { Plus, Users, Shield, Filter, MoreVertical } from 'lucide-react';
import { usePermission } from '@/utils/permission';

interface Member {
    id: number;
    name: string;
    email: string;
    initials: string;
    role: string;
    status: 'Active' | 'Pending Invite';
    lastLogin: string;
    ipAddress?: string;
}

interface Role {
    id: number;
    name: string;
    permissions_count?: number;
}

interface IndexProps {
    roles: {
        data: Array<Role>;
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    members?: Member[];
    filters: { search?: string; per_page?: string };
}

export default function Index({ roles, members: propMembers, filters }: IndexProps) {
    const { current_tenant, flash } = usePage<{ current_tenant?: { slug: string; name: string }; flash: { success?: string } }>().props;
    const { can } = usePermission();
    const tenantSlug = current_tenant?.slug || '';

    const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    // Default sample data jika backend belum mengirimkan prop members
    const membersList: Member[] = propMembers || [
        { id: 1, name: 'Iwan Budi', email: 'iwan.budi@buanaratel.co.id', initials: 'IB', role: 'Admin', status: 'Active', lastLogin: '12 Oct 2026, 08:30 WIB', ipAddress: 'IP: 103.112.4.18 (Jakarta)' },
        { id: 2, name: 'Wahyu Pratama', email: 'wahyu.p@buanaratel.co.id', initials: 'WP', role: 'Supervisor Gudang', status: 'Active', lastLogin: '11 Oct 2026, 17:45 WIB', ipAddress: 'IP: 182.253.11.90 (Surabaya)' },
        { id: 3, name: 'Siti Rahma', email: 'siti.rahma@buanaratel.co.id', initials: 'SR', role: 'Supervisor Gudang', status: 'Active', lastLogin: '12 Oct 2026, 07:15 WIB', ipAddress: 'IP: 103.112.4.22 (Jakarta)' },
        { id: 4, name: 'Ahmad Fauzi', email: 'ahmad.fauzi@buanaratel.co.id', initials: 'AF', role: 'Staff Gudang', status: 'Active', lastLogin: '12 Oct 2026, 06:10 WIB', ipAddress: 'Omni Android Scanner v3.2' },
        { id: 5, name: 'Dewi Lestari', email: 'dewi.lestari@buanaratel.co.id', initials: 'DL', role: 'Finance', status: 'Pending Invite', lastLogin: 'Never logged in', ipAddress: 'Invited 2 hours ago' },
    ];

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash?.success]);

    const applyFilters = useCallback(
        (newSearch: string, newPerPage: string) => {
            router.get(
                `/${tenantSlug}/settings/users-roles`,
                { search: newSearch, per_page: newPerPage },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [tenantSlug]
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
        router.delete(`/${tenantSlug}/settings/users-roles/${id}`, {
            onSuccess: () => toast.success('Role deleted successfully'),
        });
    };

    return (
        <AppLayout>
            <Head title="Team & Access Control" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Team & Access Control
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            Manage organization members, Spatie RBAC roles, and operational module permissions.
                        </p>
                    </div>

                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-xl shadow-xs">
                        <Link href={activeTab === 'roles' ? `/${tenantSlug}/settings/users-roles/create` : '#'}>
                            <Plus size={16} className="mr-1.5" /> {activeTab === 'roles' ? 'Add Role' : 'Add User'}
                        </Link>
                    </Button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`pb-2 text-xs font-semibold flex items-center gap-2 transition-all ${
                                    activeTab === 'members'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Users size={16} /> Team Members ({membersList.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('roles')}
                                className={`pb-2 text-xs font-semibold flex items-center gap-2 transition-all ${
                                    activeTab === 'roles'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Shield size={16} /> Roles & Permissions (Spatie RBAC)
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="w-full sm:w-auto">
                            <TableFilter
                                search={search}
                                onSearchChange={onSearchChange}
                                perPage={perPage}
                                onPerPageChange={onPerPageChange}
                            />
                        </div>
                    </div>

                    {/* CONTENT TAB 1: TEAM MEMBERS TABLE */}
                    {activeTab === 'members' && (
                        <div className="space-y-4">
                            {/* Filter Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold cursor-pointer">
                                    All ({membersList.length})
                                </span>
                                <span className="px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full text-xs font-medium cursor-pointer transition">
                                    Admin (1)
                                </span>
                                <span className="px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full text-xs font-medium cursor-pointer transition">
                                    Supervisor Gudang (2)
                                </span>
                                <span className="px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full text-xs font-medium cursor-pointer transition">
                                    Staff Gudang (1)
                                </span>
                                <span className="px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full text-xs font-medium cursor-pointer transition">
                                    Finance (1)
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-left text-xs text-muted-foreground">
                                    <thead className="bg-muted/50 uppercase text-[10px] font-bold text-foreground tracking-wider border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3">NO</th>
                                            <th className="px-4 py-3">USER</th>
                                            <th className="px-4 py-3">ROLE</th>
                                            <th className="px-4 py-3">STATUS</th>
                                            <th className="px-4 py-3">LAST LOGIN</th>
                                            <th className="px-4 py-3 text-right">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card">
                                        {membersList.map((member, idx) => (
                                            <tr key={member.id} className="hover:bg-muted/40 transition">
                                                <td className="px-4 py-3 font-mono text-muted-foreground">
                                                    00{idx + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                                                            {member.initials}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{member.name}</div>
                                                            <div className="text-[11px] text-muted-foreground">{member.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold text-[11px]">
                                                        {member.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 ${
                                                            member.status === 'Active'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                                                            }`}
                                                        />
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-foreground font-medium">{member.lastLogin}</div>
                                                    <div className="text-[10px] text-muted-foreground">{member.ipAddress}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CONTENT TAB 2: ROLES & PERMISSIONS TABLE */}
                    {activeTab === 'roles' && (
                        <DataTable
                            headers={['#', 'Role Name', 'Attached Permissions', 'Actions']}
                            data={roles.data}
                            pagination={roles}
                            renderRow={(role) => (
                                <>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        #{role.id}
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground">
                                        {role.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {role.permissions_count || 0} permissions mapped
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionButton
                                            label={role.name}
                                            showUrl={`/${tenantSlug}/settings/users-roles/${role.id}`}
                                            editUrl={`/${tenantSlug}/settings/users-roles/${role.id}/edit`}
                                            onDelete={() => processDelete(role.id)}
                                            canShow={true}
                                            canEdit={true}
                                            canDelete={true}
                                        />
                                    </TableCell>
                                </>
                            )}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
    ],
};
