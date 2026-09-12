import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Building2, Boxes, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function TenantDashboard() {
    const { current_tenant, auth } = usePage().props as any;

    return (
        <>
            <Head title={`Dashboard - ${current_tenant?.name || 'Tenant Portal'}`} />

            <div className="p-6 space-y-6">
                {/* Welcome Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Welcome back, {auth?.user?.name}! 👋
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Connected Company: <span className="font-semibold text-slate-700">{current_tenant?.name}</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                        <Building2 size={24} />
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase">
                            Total Product SKUs
                            <Boxes size={18} className="text-indigo-600" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mt-3">128 SKUs</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase">
                            Stock In (This Month)
                            <ArrowDownLeft size={18} className="text-emerald-600" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mt-3">+1,420 Items</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase">
                            Stock Out (This Month)
                            <ArrowUpRight size={18} className="text-rose-600" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mt-3">-890 Items</div>
                    </div>
                </div>
            </div>
        </>
    );
}
