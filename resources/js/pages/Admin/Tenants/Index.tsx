import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Plus, Building2, Eye, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    address?: string;
    is_active: boolean;
    users_count?: number;
    subscription?: {
        status: string;
        plan?: {
            id: number;
            name: string;
        };
    };
}

interface Plan {
    id: number;
    name: string;
}

interface Props {
    tenants: {
        data: Tenant[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total?: number;
    };
    plans: Plan[];
    filters: {
        search?: string;
        per_page?: string;
        status?: string;
        plan_id?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function TenantIndex({ tenants, plans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    
    // State Filter Sementara (sebelum tombol Apply diklik)
    const [tempStatus, setTempStatus] = useState(filters.status || 'all');
    const [tempPlan, setTempPlan] = useState(filters.plan_id || 'all');
    const [tempSortBy, setTempSortBy] = useState(filters.sort_by || 'created_at');
    const [tempSortOrder, setTempSortOrder] = useState(filters.sort_order || 'desc');

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    // State untuk Modal Hapus Profesional
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const applyFilters = useCallback(
        (newSearch: string, newPerPage: string, status: string, plan: string, sortBy: string, sortOrder: string) => {
            router.get(
                window.location.pathname,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    status: status !== 'all' ? status : undefined,
                    plan_id: plan !== 'all' ? plan : undefined,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        []
    );

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (q: string, p: string, s: string, pl: string, sb: string, so: string) =>
                    applyFilters(q, p, s, pl, sb, so),
                500
            ),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage, tempStatus, tempPlan, tempSortBy, tempSortOrder);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempStatus, tempPlan, tempSortBy, tempSortOrder);
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempStatus, tempPlan, tempSortBy, tempSortOrder);
    };

    const handleResetFilter = () => {
        setTempStatus('all');
        setTempPlan('all');
        setTempSortBy('created_at');
        setTempSortOrder('desc');
        applyFilters(search, perPage, 'all', 'all', 'created_at', 'desc');
    };

    const confirmDelete = () => {
        if (!tenantToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/tenants/${tenantToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setTenantToDelete(null);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    return (
        <>
            <Head title="Tenant Managements" />

            <div className="p-6 flex flex-col gap-6 text-foreground min-h-screen bg-background">
                {/* PAGE HEADER & TOMBOL TAMBAH */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Tenant Managements</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage registered tenants, plan tiers, and resource usage.
                        </p>
                    </div>
                    <Link
                        href="/admin/tenants/create"
                        className="h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                        <Plus className="w-4 h-4" />
                        <span>Add New Tenant</span>
                    </Link>
                </div>

                {/* TABLE FILTER KUSTOM */}
                <TableFilter
                    search={search}
                    onSearchChange={onSearchChange}
                    perPage={perPage}
                    onPerPageChange={onPerPageChange}
                >
                    <FilterDropdown onApply={handleApplyFilter} onReset={handleResetFilter}>
                        <div className="space-y-4">
                            {/* Status Tenant */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider">Status Tenant</Label>
                                <Select value={tempStatus} onValueChange={setTempStatus}>
                                    <SelectTrigger className="text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Paket Langganan */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider">Paket Langganan</Label>
                                <Select value={tempPlan} onValueChange={setTempPlan}>
                                    <SelectTrigger className="text-xs"><SelectValue placeholder="Semua Paket" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Paket</SelectItem>
                                        {plans.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Urutkan Berdasarkan */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Urutkan</Label>
                                    <Select value={tempSortBy} onValueChange={setTempSortBy}>
                                        <SelectTrigger className="text-xs"><SelectValue placeholder="Berdasarkan" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="created_at">Tanggal</SelectItem>
                                            <SelectItem value="name">Nama Tenant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Urutan</Label>
                                    <Select value={tempSortOrder} onValueChange={setTempSortOrder}>
                                        <SelectTrigger className="text-xs"><SelectValue placeholder="Urutan" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">Terbaru / Z-A</SelectItem>
                                            <SelectItem value="asc">Terlama / A-Z</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                {/* TABEL DATA TENANT */}
                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-5">No</th>
                                    <th className="py-3 px-5">Tenant</th>
                                    <th className="py-3 px-5">Plan Tier</th>
                                    <th className="py-3 px-5">Users & Usage</th>
                                    <th className="py-3 px-5 text-center">Status</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {tenants?.data && tenants.data.length > 0 ? (
                                    tenants.data.map((tenant, index) => {
                                        const isActive = tenant.subscription?.status === 'active';
                                        const usagePercent = Math.min(Math.round(((tenant.users_count || 0) / 25) * 100), 100);

                                        return (
                                            <tr key={tenant.id} className="hover:bg-muted/30 transition-colors relative">
                                                <td className="py-3.5 px-5 font-mono text-muted-foreground">
                                                    #{String((tenants.current_page - 1) * 10 + index + 1).padStart(3, '0')}
                                                </td>
                                                <td className="py-3.5 px-5 font-semibold text-foreground">
                                                    {tenant.name}
                                                    <div className="text-[11px] text-muted-foreground font-normal">/{tenant.slug}</div>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                        {tenant.subscription?.plan?.name || 'Standard Plan'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <div className="flex flex-col gap-1 max-w-[150px]">
                                                        <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                                                            <span>{tenant.users_count || 0} / 25 Users</span>
                                                            <span>{usagePercent}%</span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${usagePercent > 90 ? 'bg-destructive' : 'bg-primary'}`} 
                                                                style={{ width: `${usagePercent}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-destructive bg-destructive/10 border border-destructive/20'}`}>
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center relative">
                                                    <div className="inline-block text-left">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenDropdown(openDropdown === tenant.id ? null : tenant.id)}
                                                            className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1 border border-border"
                                                        >
                                                            <span>Actions</span>
                                                        </button>

                                                        {openDropdown === tenant.id && (
                                                            <div className="absolute right-8 mt-1 w-36 bg-popover border border-border rounded-lg shadow-2xl py-1 z-50 text-left text-popover-foreground">
                                                                <Link
                                                                    href={`/admin/tenants/${tenant.id}`}
                                                                    className="w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    <span>View Details</span>
                                                                </Link>
                                                                <Link
                                                                    href={`/admin/tenants/${tenant.id}/edit`}
                                                                    className="w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    <span>Edit Data</span>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOpenDropdown(null);
                                                                        setTenantToDelete(tenant);
                                                                    }}
                                                                    className="w-full px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2 border-t border-border cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                                    <span>Delete Data</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Building2 className="w-8 h-8 text-muted-foreground stroke-1" />
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Belum ada data tenant yang terdaftar.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            Page {tenants?.current_page || 1} of {tenants?.last_page || 1}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={!tenants?.prev_page_url}
                                onClick={() => tenants?.prev_page_url && router.visit(tenants.prev_page_url)}
                                className="px-3 py-1 bg-muted border border-border rounded-md disabled:opacity-40 hover:bg-muted/80 transition text-foreground cursor-pointer"
                            >
                                Prev
                            </button>
                            <button
                                disabled={!tenants?.next_page_url}
                                onClick={() => tenants?.next_page_url && router.visit(tenants.next_page_url)}
                                className="px-3 py-1 bg-muted border border-border rounded-md disabled:opacity-40 hover:bg-muted/80 transition text-foreground cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL KONFIRMASI HAPUS PROFESIONAL */}
            {tenantToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 flex flex-col gap-5">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <button
                                onClick={() => setTenantToDelete(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-foreground">
                                Hapus Tenant "{tenantToDelete.name}"?
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Tindakan ini bersifat permanen. Seluruh data, langganan, dan informasi terkait tenant ini akan dihapus secara permanen dari sistem database.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setTenantToDelete(null)}
                                className="h-9 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-medium transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDelete}
                                className="h-9 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Tenant'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

TenantIndex.layout = (page: React.ReactNode) => <AppLayout children={page} breadcrumbs={[{ title: 'Tenants Management', href: '/admin/tenants' }]} />;