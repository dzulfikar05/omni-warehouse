import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Plus, CheckCircle2, Users, Edit, ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface PlanFeature {
    id: number;
    feature_key: string;
    value: string;
}

interface Plan {
    id: number;
    name: string;
    slug: string;
    desc?: string;
    price: number;
    is_active: boolean;
    features: PlanFeature[];
    subscriptions_count?: number;
}

interface Props {
    plans: Plan[];
}

export default function PlanIndex({ plans }: Props) {
    const formatRupiah = (amount: number) => {
        if (amount >= 1000000) {
            const formatted = amount / 1000000;
            return `IDR ${formatted % 1 === 0 ? formatted : formatted.toFixed(1).replace('.', ',')}jt`;
        }
        return `IDR ${(amount / 1000).toLocaleString('id-ID')}k`;
    };

    return (
        <>
            <Head title="Plans & Features" />

            <div className="p-6 flex flex-col gap-6 text-foreground min-h-screen bg-background">
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Plans & Features</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage subscription tiers, feature flags, and pricing modules.
                        </p>
                    </div>
                    <Link
                        href="/admin/plans/create"
                        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Plans</span>
                    </Link>
                </div>

                {/* CONTAINER UTAMA */}
                <div className="bg-card rounded-2xl border border-border shadow-xl p-6 flex flex-col gap-6">
                    <div>
                        <h2 className="text-sm font-bold tracking-tight text-foreground">Preview Catalog Plans</h2>
                        <p className="text-xs text-muted-foreground">Tampilan paket langganan yang aktif untuk pendaftaran tenant.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans && plans.length > 0 ? (
                            plans.map((plan, index) => {
                                // Kartu tengah (Pro Warehouse) disorot khusus sesuai gambar referensi
                                const isFeatured = index === 1 || plan.slug === 'pro-warehouse';

                                return (
                                    <div
                                        key={plan.id}
                                        className={`rounded-2xl border flex flex-col justify-between p-6 transition-all relative ${
                                            isFeatured
                                                ? 'border-blue-500 bg-card shadow-xl ring-2 ring-blue-500/20 scale-[1.02]'
                                                : 'border-border bg-card/60 hover:border-border/80'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-5">
                                            <div className="flex flex-col gap-1">
                                                <h3 className={`text-sm font-bold ${isFeatured ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                                                    {plan.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed min-h-[32px]">
                                                    {plan.desc || 'Paket solusi manajemen inventaris gudang.'}
                                                </p>
                                            </div>

                                            {/* Box Harga dengan latar belakang kebiruan muda */}
                                            <div className={`p-4 rounded-xl border flex items-baseline gap-1.5 ${
                                                isFeatured 
                                                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50' 
                                                    : 'bg-muted/40 border-border/60'
                                            }`}>
                                                <span className="text-xl font-extrabold tracking-tight text-foreground">
                                                    {formatRupiah(Number(plan.price))}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-medium">/ bln</span>
                                            </div>

                                            {/* Daftar Fitur */}
                                            <div className="flex flex-col gap-2.5 pt-2">
                                                {plan.features && plan.features.length > 0 ? (
                                                    plan.features.map((feat) => (
                                                        <div key={feat.id} className="flex items-start gap-2.5 text-xs text-foreground">
                                                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                                            <span className="leading-tight">{feat.value}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Belum ada fitur diatur.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer Card: Tenant Count & Action Button */}
                                        <div className="flex flex-col gap-4 pt-6 mt-6 border-t border-border">
                                            <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
                                                isFeatured ? 'bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-muted-foreground'
                                            }`}>
                                                <span>Current Tenants</span>
                                                <span className="font-semibold flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {plan.subscriptions_count || 0} tenants
                                                </span>
                                            </div>

                                            <Link
                                                href={`/admin/plans/${plan.id}/edit`}
                                                className={`w-full h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                    isFeatured
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                        : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                                }`}
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                <span>Edit Plan Details</span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-3 py-12 text-center text-muted-foreground">
                                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground stroke-1" />
                                <p className="text-xs font-medium">Belum ada data paket langganan yang tersedia.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

PlanIndex.layout = (page: React.ReactNode) => (
    <AppLayout children={page} breadcrumbs={[{ title: 'Plans Management', href: '/admin/plans' }]} />
);