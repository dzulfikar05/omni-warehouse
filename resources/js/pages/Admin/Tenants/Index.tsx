import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Search, Building2, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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
    };
    plans: Plan[];
    filters: {
        search?: string;
        plan_id?: string;
        status?: string;
    };
}

export default function TenantIndex({ tenants, plans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/tenants', { search }, { preserveState: true });
    };

    const handleDelete = (tenantId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tenant ini?')) {
            router.delete(`/admin/tenants/${tenantId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Tenant Managements" />

            <div className="p-6 flex flex-col gap-6 text-foreground min-h-screen bg-background">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight">Tenant Managements</h1>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col">
                    {/* Header Card */}
                    <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-foreground">Tenant List</h2>
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

                    {/* Search Bar */}
                    <div className="p-5 border-b border-border flex items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tenant..."
                                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring transition-all"
                            />
                        </form>
                    </div>

                    {/* Table */}
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
                                {tenants.data.length > 0 ? (
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
                                                                <button
                                                                    onClick={() => alert(`View details for ${tenant.name}`)}
                                                                    className="w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    <span>View Details</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => alert(`Edit tenant ${tenant.name}`)}
                                                                    className="w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 cursor-pointer"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    <span>Edit Data</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setOpenDropdown(null);
                                                                        handleDelete(tenant.id);
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
                            Page {tenants.current_page} of {tenants.last_page || 1}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={!tenants.prev_page_url}
                                onClick={() => tenants.prev_page_url && router.visit(tenants.prev_page_url)}
                                className="px-3 py-1 bg-muted border border-border rounded-md disabled:opacity-40 hover:bg-muted/80 transition text-foreground cursor-pointer"
                            >
                                Prev
                            </button>
                            <button
                                disabled={!tenants.next_page_url}
                                onClick={() => tenants.next_page_url && router.visit(tenants.next_page_url)}
                                className="px-3 py-1 bg-muted border border-border rounded-md disabled:opacity-40 hover:bg-muted/80 transition text-foreground cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

TenantIndex.layout = (page: React.ReactNode) => <AppLayout children={page} breadcrumbs={[{ title: 'Tenants Management', href: '/admin/tenants' }]} />;