import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Building2,
    CreditCard,
    TrendingUp,
    Users,
    Calendar,
    ArrowUpRight,
    Layers,
    CheckCircle2,
    Clock,
} from 'lucide-react';

interface Props {
    stats: {
        total_tenants: number;
        active_tenants: number;
        active_subscriptions: number;
        monthly_mrr: number;
        central_users_count: number;
    };
    revenue_chart: Array<{ date: string; total_subscriptions: number }>;
    tenant_growth_chart: Array<{ date: string; total_registered: number }>;
    recent_tenants: Array<{
        id: number;
        name: string;
        slug: string;
        status: string;
        plan?: { name: string };
        created_at: string;
    }>;
    recent_subscriptions: Array<{
        id: number;
        status: string;
        tenant?: { name: string; slug: string };
        plan?: { name: string; price: number };
        created_at: string;
    }>;
    period: string;
}

export default function Dashboard({
    stats,
    revenue_chart,
    tenant_growth_chart,
    recent_tenants,
    recent_subscriptions,
    period,
}: Props) {
    const { t } = useTranslation();
    const { can } = usePermission();
    const [selectedPeriod, setSelectedPeriod] = useState(period || '30_days');

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get('/dashboard', { period: newPeriod }, { preserveState: true, preserveScroll: true });
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title={t("Platform Executive Dashboard")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Executive Dashboard")}
                    description={t("Overview of tenant growth, recurring monthly revenue, and central administration activity.")}
                    renderAction={
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1">
                            <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                            <select
                                value={selectedPeriod}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="h-8 rounded-lg bg-transparent text-xs font-medium focus:outline-none"
                            >
                                <option value="7_days">{t("Last 7 Days")}</option>
                                <option value="30_days">{t("Last 30 Days")}</option>
                                <option value="90_days">{t("Last 90 Days")}</option>
                                <option value="1_year">{t("Last 1 Year")}</option>
                            </select>
                        </div>
                    }
                />

                {/* 1. KPI Stats Cards Section */}
                {can('central.dashboard.stats_cards') && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">{t("Total Active Tenants")}</p>
                                <h3 className="mt-1 text-2xl font-bold text-foreground">
                                    {stats?.active_tenants || 0} {t("/")}{' '}<span className="text-sm font-normal text-muted-foreground">{stats?.total_tenants || 0}</span>
                                </h3>
                            </div>
                            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
                                <Building2 size={22} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">{t("Monthly MRR (Active)")}</p>
                                <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatRupiah(stats?.monthly_mrr || 0)}
                                </h3>
                            </div>
                            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp size={22} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">{t("Active Subscriptions")}</p>
                                <h3 className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats?.active_subscriptions || 0}
                                </h3>
                            </div>
                            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
                                <CreditCard size={22} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-xs">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">{t("Central Admin Users")}</p>
                                <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {stats?.central_users_count || 0}
                                </h3>
                            </div>
                            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                                <Users size={22} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Charts Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {can('central.dashboard.revenue_chart') && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">{t("Subscription Registrations")}</h4>
                                    <p className="text-xs text-muted-foreground">{t("New subscription activity over the selected period")}</p>
                                </div>
                                <Layers className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="mt-6 flex h-48 items-end gap-2 border-b border-border/60 pb-2">
                                {revenue_chart && revenue_chart.length > 0 ? (
                                    revenue_chart.map((item, idx) => (
                                        <div key={idx} className="group relative flex flex-1 flex-col items-center gap-1">
                                            <div
                                                className="w-full rounded-t-md bg-blue-600/80 transition-all group-hover:bg-blue-600"
                                                style={{ height: `${Math.min(item.total_subscriptions * 25 + 15, 100)}%` }}
                                            />
                                            <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">
                                                {item.date.substring(5)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                        {t("No subscription data in this period.")}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {can('central.dashboard.tenant_growth_chart') && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">{t("Tenant Onboarding Trend")}</h4>
                                    <p className="text-xs text-muted-foreground">{t("New tenant organizations created")}</p>
                                </div>
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="mt-6 flex h-48 items-end gap-2 border-b border-border/60 pb-2">
                                {tenant_growth_chart && tenant_growth_chart.length > 0 ? (
                                    tenant_growth_chart.map((item, idx) => (
                                        <div key={idx} className="group relative flex flex-1 flex-col items-center gap-1">
                                            <div
                                                className="w-full rounded-t-md bg-emerald-500/80 transition-all group-hover:bg-emerald-500"
                                                style={{ height: `${Math.min(item.total_registered * 30 + 15, 100)}%` }}
                                            />
                                            <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">
                                                {item.date.substring(5)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                        {t("No new tenant onboardings in this period.")}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Tables Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Tenants Table */}
                    {can('central.dashboard.recent_tenants_table') && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h4 className="text-sm font-bold text-foreground">{t("Recently Registered Tenants")}</h4>
                                {can('central.tenants.view') && (
                                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                        <Link href="/admin/tenants">
                                            {t("View All")}{' '}<ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                                            <th className="py-2.5 px-3">{t("TENANT")}</th>
                                            <th className="py-2.5 px-3">{t("PLAN")}</th>
                                            <th className="py-2.5 px-3">{t("STATUS")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recent_tenants && recent_tenants.length > 0 ? (
                                            recent_tenants.map((tenant) => (
                                                <tr key={tenant.id} className="hover:bg-muted/20">
                                                    <td className="py-2.5 px-3 font-semibold">
                                                        {tenant.name}
                                                        <div className="text-[10px] font-normal text-muted-foreground">{t("slug:")}{' '}{tenant.slug}</div>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {tenant.plan?.name || t("No Plan")}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                                tenant.status === 'active'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            {tenant.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                                                    {t("No recent tenant records.")}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Recent Subscriptions Table */}
                    {can('central.dashboard.recent_subscriptions_table') && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h4 className="text-sm font-bold text-foreground">{t("Recent Subscriptions")}</h4>
                                {can('central.subscriptions.view') && (
                                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                        <Link href="/admin/subscriptions">
                                            {t("View All")}{' '}<ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                                            <th className="py-2.5 px-3">{t("TENANT")}</th>
                                            <th className="py-2.5 px-3">{t("PLAN & PRICE")}</th>
                                            <th className="py-2.5 px-3">{t("STATUS")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recent_subscriptions && recent_subscriptions.length > 0 ? (
                                            recent_subscriptions.map((s) => (
                                                <tr key={s.id} className="hover:bg-muted/20">
                                                    <td className="py-2.5 px-3 font-semibold">
                                                        {s.tenant?.name || t("N/A")}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono">
                                                        {s.plan?.name || '-'} {t("(")}{formatRupiah(s.plan?.price || 0)}{t(")")}</td>
                                                    <td className="py-2.5 px-3">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                                s.status === 'active'
                                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                            }`}
                                                        >
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                                                    {t("No recent subscription records.")}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: '/dashboard',
        },
    ],
};
