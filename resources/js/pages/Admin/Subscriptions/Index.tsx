import React, { useState, useCallback, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Download, Plus, TrendingUp, DollarSign, AlertTriangle, Activity, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Subscription {
    id: number;
    tenant: {
        name: string;
        slug: string;
    };
    plan: {
        name: string;
        price: number;
    };
    active_seats?: number;
    monthly_invoiced: number;
    health_score: number;
    status: string;
}

interface Props {
    subscriptions: {
        data: Subscription[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    stats: {
        net_revenue: number;
        paid_count: number;
        past_due_count: number;
        churn_rate: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function SubscriptionIndex({ subscriptions, stats, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [activeTab, setActiveTab] = useState(filters?.status || 'all');

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const applyFilter = (newSearch: string, status: string) => {
        router.get(
            window.location.pathname,
            {
                search: newSearch,
                status: status !== 'all' ? status : undefined,
            },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const debouncedSearch = useMemo(
        () => debounce((q: string, s: string) => applyFilter(q, s), 500),
        []
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        debouncedSearch(val, activeTab);
    };

    const handleTabChange = (status: string) => {
        setActiveTab(status);
        applyFilter(search, status);
    };

    return (
        <>
            <Head title="Subscriptions" />

            <div className="p-6 flex flex-col gap-6 text-foreground min-h-screen bg-background">
                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Subscriptions</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage tenant billing, invoices, and subscription plans.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="h-9 px-3 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <Link
                            href="/admin/subscriptions/create-invoice"
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Create Manual Invoice
                        </Link>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Monthly Revenue</span>
                            <span className="p-1.5 bg-blue-500/10 text-blue-600 rounded-md"><TrendingUp className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-lg font-extrabold">{formatRupiah(stats?.net_revenue || 12450000)}</h3>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold rounded">+15.2%</span>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Paid Invoices (Current)</span>
                            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-md"><DollarSign className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-lg font-extrabold">{stats?.paid_count || 46} <span className="text-xs text-muted-foreground font-normal">/ 48</span></h3>
                            <span className="text-[11px] text-muted-foreground mt-1 block">Rp 9.000.000</span>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Past Due & Retrying</span>
                            <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-md"><AlertTriangle className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-lg font-extrabold">{stats?.past_due_count || 2} <span className="text-xs text-muted-foreground font-normal">Tenants</span></h3>
                            <span className="text-[11px] text-amber-600 mt-1 block font-medium">Rp 3.000.000 at risk</span>
                        </div>
                    </div>

                    <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Gross Churn Rate</span>
                            <span className="p-1.5 bg-rose-500/10 text-rose-600 rounded-md"><Activity className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-lg font-extrabold">{stats?.churn_rate || 1.2}%</h3>
                            <span className="text-[11px] text-muted-foreground mt-1 block">Target &lt; 2.5%</span>
                        </div>
                    </div>
                </div>

                {/* TAB FILTER & TABLE CONTAINER */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                    {/* Filter Tabs & Search */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full md:w-auto">
                            <button
                                onClick={() => handleTabChange('all')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                All Subscriptions
                            </button>
                            <button
                                onClick={() => handleTabChange('active')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'active' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Active Paid
                            </button>
                            <button
                                onClick={() => handleTabChange('past_due')}
                                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'past_due' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Past Due Experience
                            </button>
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={onSearchChange}
                                placeholder="Search by subscription name..."
                                className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-4">TENANT ORGANIZATION</th>
                                    <th className="py-3 px-4">PLAN TIER</th>
                                    <th className="py-3 px-4">ACTIVE SEATS</th>
                                    <th className="py-3 px-4">MONTHLY INVOICED</th>
                                    <th className="py-3 px-4">HEALTH SCORE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {subscriptions?.data && subscriptions.data.length > 0 ? (
                                    subscriptions.data.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold">
                                                {sub.tenant?.name || 'Tenant Name'}
                                                <div className="text-[11px] text-muted-foreground font-normal">tenant-sub: {sub.tenant?.slug || 'slug'}</div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2.5 py-1 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-wider">
                                                    {sub.plan?.name || 'ENTERPRISE AI'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono">{sub.active_seats || 124} users</td>
                                            <td className="py-3.5 px-4 font-mono font-semibold">
                                                {formatRupiah(sub.plan?.price || sub.monthly_invoiced || 2450000)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="flex items-center gap-1 font-mono text-emerald-600 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {sub.health_score || 98} / 100
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground">Belum ada data langganan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
                        <div>Page {subscriptions?.current_page || 1} of {subscriptions?.last_page || 1}</div>
                        <div className="flex gap-2">
                            <button
                                disabled={!subscriptions?.prev_page_url}
                                onClick={() => subscriptions?.prev_page_url && router.visit(subscriptions.prev_page_url)}
                                className="px-3 py-1 bg-muted border border-border rounded-md disabled:opacity-40 hover:bg-muted/80 transition text-foreground cursor-pointer"
                            >
                                Prev
                            </button>
                            <button
                                disabled={!subscriptions?.next_page_url}
                                onClick={() => subscriptions?.next_page_url && router.visit(subscriptions.next_page_url)}
                                className="px-3 py-1 bg-muted border border-border rounded-md disabled:opacity-40 hover:bg-muted/80 transition text-foreground cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* GATEWAY EVENT STREAM WIDGET */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm max-w-lg flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" /> Gateway Event Stream
                        </h4>
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                        </span>
                    </div>
                    <div className="flex flex-col gap-2.5 text-xs">
                        <div className="flex items-start justify-between pb-2 border-b border-border/60">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">invoice.payment_succeeded</p>
                                    <p className="text-[11px] text-muted-foreground">PT Digital Nusantara • $1,200.00</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">2m ago</span>
                        </div>
                        <div className="flex items-start justify-between pb-2 border-b border-border/60">
                            <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">customer.subscription.updated</p>
                                    <p className="text-[11px] text-muted-foreground">PT Buanaratai Logistics • Pro Plan</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">18m ago</span>
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-foreground">invoice.payment_failed</p>
                                    <p className="text-[11px] text-muted-foreground">PT Kaltim Logistik • Dunning Stage 1</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">1h ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SubscriptionIndex.layout = (page: React.ReactNode) => (
    <AppLayout children={page} breadcrumbs={[{ title: 'Subscriptions Management', href: '/admin/subscriptions' }]} />
);