import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    FileText,
    FileSpreadsheet,
    Plus,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Search,
    Layers,
    Calendar,
    Filter,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { usePermission } from '@/utils/permission';
import { toast } from 'sonner';

interface Subscription {
    id: number;
    tenant_id: number;
    plan_id: number;
    status: string;
    ends_at?: string;
    created_at: string;
    tenant?: {
        id: number;
        name: string;
        slug: string;
        email?: string;
    };
    plan?: {
        id: number;
        name: string;
        price: number;
    };
}

interface PlanOption {
    id: number;
    name: string;
}

interface Props {
    subscriptions: {
        data: Subscription[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    stats: {
        net_revenue: number;
        active_count: number;
        past_due_count: number;
        total_count: number;
    };
    plans: PlanOption[];
    filters: {
        search?: string;
        status?: string;
        plan_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function SubscriptionIndex({ subscriptions, stats, plans, filters }: Props) {
    const { flash } = usePage().props as any;
    const { can } = usePermission();

    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    // Filter States
    const [search, setSearch] = useState(filters?.search || '');
    const [activeTab, setActiveTab] = useState(filters?.status || 'all');
    const [selectedPlan, setSelectedPlan] = useState(filters?.plan_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const applyFilter = (params: Record<string, any>) => {
        router.get(
            window.location.pathname,
            {
                search: params.search || undefined,
                status: params.status !== 'all' ? params.status : undefined,
                plan_id: params.plan_id || undefined,
                date_from: params.date_from || undefined,
                date_to: params.date_to || undefined,
            },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const debouncedSearch = useMemo(
        () =>
            debounce((q: string, st: string, pl: string, df: string, dt: string) => {
                applyFilter({ search: q, status: st, plan_id: pl, date_from: df, date_to: dt });
            }, 500),
        []
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        debouncedSearch(val, activeTab, selectedPlan, dateFrom, dateTo);
    };

    const handleTabChange = (status: string) => {
        setActiveTab(status);
        applyFilter({ search, status, plan_id: selectedPlan, date_from: dateFrom, date_to: dateTo });
    };

    const handlePlanFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedPlan(val);
        applyFilter({ search, status: activeTab, plan_id: val, date_from: dateFrom, date_to: dateTo });
    };

    const handleDateFilterChange = (df: string, dt: string) => {
        setDateFrom(df);
        setDateTo(dt);
        applyFilter({ search, status: activeTab, plan_id: selectedPlan, date_from: df, date_to: dt });
    };

    const handleResetFilters = () => {
        setSearch('');
        setActiveTab('all');
        setSelectedPlan('');
        setDateFrom('');
        setDateTo('');
        router.get(window.location.pathname, {}, { preserveState: true, replace: true });
    };

    // Handler Export terintegrasi filter aktif
    const handleExportPdf = () => {
        router.post('/admin/subscriptions/export-pdf', {
            search: search || undefined,
            status: activeTab !== 'all' ? activeTab : undefined,
            plan_id: selectedPlan || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
    };

    const handleExportExcel = () => {
        router.post('/admin/subscriptions/export-excel', {
            search: search || undefined,
            status: activeTab !== 'all' ? activeTab : undefined,
            plan_id: selectedPlan || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
    };

    const canCreateInvoice = can('central.subscriptions.create_invoice');
    const canExport = can('central.subscriptions.export');

    return (
        <>
            <Head title="Subscriptions" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Subscriptions Management"
                    description="Monitor active tenant subscriptions, revenue metrics, and issue manual invoices."
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
                            {canCreateInvoice && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href="/admin/subscriptions/create-invoice">
                                        <Plus className="mr-1.5 h-4 w-4" /> Create Manual Invoice
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Section Cards KPI */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Monthly Active MRR</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">
                                {formatRupiah(stats?.net_revenue || 0)}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <TrendingUp size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Active Subscriptions</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats?.active_count || 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Past Due Subscriptions</p>
                            <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {stats?.past_due_count || 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50">
                            <AlertTriangle size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Registered</p>
                            <h3 className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {stats?.total_count || 0}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50">
                            <Layers size={22} />
                        </div>
                    </div>
                </div>

                {/* Filter & Table Container */}
                <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    {/* Status Tabs & Search */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted/40 p-1 text-xs font-semibold md:w-auto">
                            {['all', 'active', 'past_due', 'canceled'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => handleTabChange(st)}
                                    className={`rounded-lg px-3 py-1.5 transition ${
                                        activeTab === st
                                            ? 'bg-background font-bold text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {st === 'all'
                                        ? 'All'
                                        : st === 'active'
                                        ? 'Active'
                                        : st === 'past_due'
                                        ? 'Past Due'
                                        : 'Canceled'}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={onSearchChange}
                                placeholder="Search tenant name or slug..."
                                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                    </div>

                    {/* Advanced Filters Toolbar */}
                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Filter className="h-3 w-3" /> Filter Plan Tier
                            </label>
                            <select
                                value={selectedPlan}
                                onChange={handlePlanFilterChange}
                                className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                            >
                                <option value="">All Plan Tiers</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> From Date
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => handleDateFilterChange(e.target.value, dateTo)}
                                className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> To Date
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => handleDateFilterChange(dateFrom, e.target.value)}
                                className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-8 w-full gap-1 border-border text-xs"
                            >
                                <RotateCcw className="h-3 w-3" /> Reset Filters
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                                <tr>
                                    <th className="py-3 px-4">TENANT ORGANIZATION</th>
                                    <th className="py-3 px-4">PLAN TIER</th>
                                    <th className="py-3 px-4">PRICE / MONTH</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4">EXPIRATION / END DATE</th>
                                    <th className="py-3 px-4">CREATED AT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subscriptions?.data && subscriptions.data.length > 0 ? (
                                    subscriptions.data.map((sub) => (
                                        <tr key={sub.id} className="transition-colors hover:bg-muted/30">
                                            <td className="py-3.5 px-4 font-semibold">
                                                {sub.tenant?.name || 'N/A'}
                                                <div className="text-[11px] font-normal text-muted-foreground">
                                                    slug: {sub.tenant?.slug || '-'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="rounded bg-foreground/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
                                                    {sub.plan?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono font-semibold">
                                                {formatRupiah(sub.plan?.price || 0)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                        sub.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            : sub.status === 'past_due'
                                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-muted-foreground">
                                                {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('id-ID') : 'Lifetime / Auto-renew'}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-muted-foreground">
                                                {new Date(sub.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No subscription records found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                        <div>
                            Showing page {subscriptions?.current_page || 1} of {subscriptions?.last_page || 1} ({subscriptions?.total || 0} total)
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!subscriptions?.prev_page_url}
                                onClick={() => subscriptions?.prev_page_url && router.visit(subscriptions.prev_page_url)}
                                className="h-8 border-border text-xs"
                            >
                                Prev
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!subscriptions?.next_page_url}
                                onClick={() => subscriptions?.next_page_url && router.visit(subscriptions.next_page_url)}
                                className="h-8 border-border text-xs"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SubscriptionIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Subscriptions Management', href: '/admin/subscriptions' },
    ],
};
