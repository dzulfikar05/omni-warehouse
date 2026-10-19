import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { usePermission } from '@/utils/permission';
import {
    Building2,
    Boxes,
    ArrowDownLeft,
    ArrowUpRight,
    AlertTriangle,
    History,
    Package,
    ArrowRight,
    TrendingUp,
    PieChart,
    CheckCircle2,
    Inbox,
    BarChart3,
} from 'lucide-react';

interface StatsProps {
    total_skus: number;
    total_products: number;
    stock_in_this_month: number;
    stock_out_this_month: number;
}

interface TrendItem {
    month: string;
    in: number;
    out: number;
}

interface LowStockItem {
    id: number;
    sku_code: string;
    product_name: string;
    current_stock: number;
    min_stock: number;
    unit: string;
}

interface MovementItem {
    id: number;
    sku_code: string;
    product_name: string;
    type: 'inbound' | 'outbound' | 'transfer';
    quantity: number;
    user: string;
    created_at: string;
}

interface DashboardProps {
    stats?: StatsProps;
    movementTrend?: TrendItem[];
    comparison?: {
        inbound: { completed: number; pending: number };
        outbound: { completed: number; pending: number };
    };
    lowStockAlerts?: LowStockItem[];
    recentMovements?: MovementItem[];
}

export default function TenantDashboard({
    stats,
    movementTrend = [],
    comparison,
    lowStockAlerts = [],
    recentMovements = [],
}: DashboardProps) {
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    // Hitung max value untuk skala tinggi bar chart
    const maxVal = Math.max(
        ...movementTrend.map((t) => Math.max(t.in, t.out)),
        10
    );

    // Total status transaksi untuk kalkulasi progress bar
    const totalTransactions = comparison
        ? comparison.inbound.completed +
          comparison.inbound.pending +
          comparison.outbound.completed +
          comparison.outbound.pending
        : 0;

    const hasTrendData = movementTrend.some((t) => t.in > 0 || t.out > 0);

    return (
        <>
            <Head title={`Dashboard - ${current_tenant?.name || 'Tenant Portal'}`} />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Welcome */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-500/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {/* <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            System Live Operations
                        </div> */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome back, {auth?.user?.name}! 👋
                        </h1>
                        <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                            Connected Organization: <span className="font-bold underline decoration-blue-300 underline-offset-2">{current_tenant?.name}</span>
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                        <Building2 size={28} />
                    </div>
                </div>

                {/* Section A: Stats Summary Cards */}
                {can('tenant.dashboard.stats_cards') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">TOTAL PRODUCTS</p>
                                <h3 className="text-2xl font-extrabold mt-1 text-foreground">
                                    {stats?.total_products ?? 0} <span className="text-xs font-normal text-muted-foreground">Items</span>
                                </h3>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
                                    Master Catalog
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                                <Package size={22} />
                            </div>
                        </div>

                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">TOTAL SKUS</p>
                                <h3 className="text-2xl font-extrabold mt-1 text-foreground">
                                    {stats?.total_skus ?? 0} <span className="text-xs font-normal text-muted-foreground">Variants</span>
                                </h3>
                                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 flex items-center gap-1">
                                    Active Inventory Lines
                                </p>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                <Boxes size={22} />
                            </div>
                        </div>

                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">STOCK IN (MONTH)</p>
                                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                    +{(stats?.stock_in_this_month ?? 0).toLocaleString()}
                                </h3>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                                    Received Inbound Items
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                <ArrowDownLeft size={22} />
                            </div>
                        </div>

                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-muted-foreground font-bold tracking-wider uppercase">STOCK OUT (MONTH)</p>
                                <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                                    -{(stats?.stock_out_this_month ?? 0).toLocaleString()}
                                </h3>
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                                    Dispatched Outbound Items
                                </p>
                            </div>
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl dark:bg-rose-950/60 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                                <ArrowUpRight size={22} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Section B & C: Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Section B: Stock Movement Trend */}
                    {can('tenant.dashboard.stock_trend_chart') && (
                        <div className="lg:col-span-2 bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                    <TrendingUp className="text-blue-600 w-4 h-4" /> Stock Flow Trend (Last 6 Months)
                                </h2>
                                {hasTrendData && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stock In
                                        </span>
                                        <span className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Stock Out
                                        </span>
                                    </div>
                                )}
                            </div>

                            {hasTrendData ? (
                                <div className="pt-6 pb-2 grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 border-b border-border">
                                    {movementTrend.map((item, idx) => {
                                        const inHeight = Math.round((item.in / maxVal) * 100);
                                        const outHeight = Math.round((item.out / maxVal) * 100);

                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                                                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                                                    {/* Bar Stock In */}
                                                    <div
                                                        style={{ height: `${Math.max(inHeight, 4)}%` }}
                                                        className="w-3 sm:w-5 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all group relative cursor-pointer"
                                                    >
                                                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border z-10">
                                                            In: {item.in}
                                                        </span>
                                                    </div>
                                                    {/* Bar Stock Out */}
                                                    <div
                                                        style={{ height: `${Math.max(outHeight, 4)}%` }}
                                                        className="w-3 sm:w-5 bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all group relative cursor-pointer"
                                                    >
                                                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border z-10">
                                                            Out: {item.out}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate w-full text-center">
                                                    {item.month}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Empty State untuk Trend Chart */
                                <div className="h-56 rounded-xl bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-2">
                                        <BarChart3 size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">No Stock Movement Data</h4>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                                        Stock flow trends will automatically appear once inbound or outbound transactions take place.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section C: Transaction Breakdown Progress Bars */}
                    {can('tenant.dashboard.inbound_outbound_chart') && (
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <PieChart className="w-4 h-4 text-indigo-600" /> Transaction Status Breakdown
                            </h2>

                            {comparison && totalTransactions > 0 ? (
                                <div className="space-y-4 my-auto">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-emerald-600 dark:text-emerald-400">Inbound Completed</span>
                                            <span className="font-mono text-foreground">{comparison.inbound.completed} Docs</span>
                                        </div>
                                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-500"
                                                style={{
                                                    width: `${(comparison.inbound.completed / totalTransactions) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-emerald-500 dark:text-emerald-300">Inbound Pending</span>
                                            <span className="font-mono text-foreground">{comparison.inbound.pending} Docs</span>
                                        </div>
                                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-emerald-300 dark:bg-emerald-600 h-full transition-all duration-500"
                                                style={{
                                                    width: `${(comparison.inbound.pending / totalTransactions) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-rose-600 dark:text-rose-400">Outbound Completed</span>
                                            <span className="font-mono text-foreground">{comparison.outbound.completed} Docs</span>
                                        </div>
                                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-rose-500 h-full transition-all duration-500"
                                                style={{
                                                    width: `${(comparison.outbound.completed / totalTransactions) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-rose-500 dark:text-rose-300">Outbound Pending</span>
                                            <span className="font-mono text-foreground">{comparison.outbound.pending} Docs</span>
                                        </div>
                                        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-rose-300 dark:bg-rose-600 h-full transition-all duration-500"
                                                style={{
                                                    width: `${(comparison.outbound.pending / totalTransactions) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Empty State untuk Breakdown Status */
                                <div className="py-8 rounded-xl bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center p-6 text-center my-auto">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center mb-2">
                                        <PieChart size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">No Transactions Created</h4>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                                        Inbound and outbound document status metrics will be tracked here.
                                    </p>
                                </div>
                            )}

                            <div className="p-3 bg-muted/40 rounded-xl text-center text-xs text-muted-foreground border border-border">
                                Total Monitored: <strong className="text-foreground font-mono">{totalTransactions} Documents</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section D & E: Tables Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Section D: Low Stock Alerts Table */}
                    {can('tenant.dashboard.low_stock_table') && (
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                    <AlertTriangle className="w-4 h-4" /> Low Stock Warning
                                </h2>
                                {lowStockAlerts.length > 0 && (
                                    <Link
                                        href={`/${current_tenant?.slug}/inventory/skus`}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        View All <ArrowRight size={12} />
                                    </Link>
                                )}
                            </div>

                            {lowStockAlerts.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-border">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                                                <th className="p-3">SKU CODE</th>
                                                <th className="p-3">PRODUCT</th>
                                                <th className="p-3">CURRENT</th>
                                                <th className="p-3">MIN STOCK</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {lowStockAlerts.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                        {item.sku_code}
                                                    </td>
                                                    <td className="p-3 font-medium text-foreground">{item.product_name}</td>
                                                    <td className="p-3">
                                                        <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-bold px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                                                            {item.current_stock} {item.unit}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-mono text-muted-foreground">
                                                        {item.min_stock} {item.unit}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                /* Positive Empty State saat Semua Stok Aman */
                                <div className="py-8 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400 flex items-center justify-center mb-2">
                                        <CheckCircle2 size={22} />
                                    </div>
                                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">All Stocks Are Optimal</h4>
                                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 max-w-xs mt-0.5">
                                        No SKUs are currently below their defined minimum safety thresholds.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section E: Recent Stock Movements Table */}
                    {can('tenant.dashboard.recent_movements_table') && (
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Recent Activity Audit
                                </h2>
                            </div>

                            {recentMovements.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-border">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                                                <th className="p-3">SKU / ITEM</th>
                                                <th className="p-3">TYPE</th>
                                                <th className="p-3">QTY</th>
                                                <th className="p-3">TIME</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {recentMovements.map((m) => (
                                                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3">
                                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                                                            {m.sku_code}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground truncate max-w-[140px] block">
                                                            {m.product_name}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                                m.type === 'inbound'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                                                                    : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800'
                                                            }`}
                                                        >
                                                            {m.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-mono font-bold text-foreground">{m.quantity}</td>
                                                    <td className="p-3 text-muted-foreground whitespace-nowrap">{m.created_at}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                /* Empty State untuk Audit Pergerakan Stok */
                                <div className="py-8 rounded-xl bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center mb-2">
                                        <Inbox size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold text-foreground">No Activity Recorded</h4>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                                        Stock inventory adjustments and transaction movements will log here in real time.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

TenantDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '#' }],
};
