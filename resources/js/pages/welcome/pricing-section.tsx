import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Plan } from './types';

interface PricingSectionProps {
    plans?: Plan[];
}

const FALLBACK_PLANS: Plan[] = [
    {
        id: 1,
        name: 'Starter',
        slug: 'starter',
        desc: 'Cocok untuk depot kecil dan gudang satu lokasi yang baru memulai digitalisasi operasional.',
        price: 299000,
        is_active: true,
        features: [
            { id: 1, feature_key: 'warehouses', value: '1 Lokasi Gudang Active' },
            { id: 2, feature_key: 'users', value: 'Hingga 5 Akun Pengguna' },
            { id: 3, feature_key: 'sku', value: '500 SKU Aktif Terdaftar' },
            { id: 4, feature_key: 'support', value: 'Dukungan via Email & Tiket' },
            { id: 5, feature_key: 'api', value: 'Akses REST API Dasar' },
        ],
    },
    {
        id: 2,
        name: 'Professional',
        slug: 'pro-plan',
        desc: 'Untuk gudang beroperasi tinggi yang butuh telemetri stok real-time dan otokanal picking.',
        price: 899000,
        is_active: true,
        features: [
            { id: 6, feature_key: 'warehouses', value: 'Hingga 5 Lokasi Gudang' },
            { id: 7, feature_key: 'users', value: 'Hingga 25 Akun Pengguna' },
            { id: 8, feature_key: 'sku', value: 'SKU Aktif Tidak Terbatas' },
            { id: 9, feature_key: 'telemetry', value: 'Telemetri Stok Real-Time' },
            { id: 10, feature_key: 'rbac', value: 'Hak Akses RBAC (Admin/Supervisor/Picker)' },
            { id: 11, feature_key: 'support', value: 'Dukungan Prioritas SLA 2 Jam' },
            { id: 12, feature_key: 'api', value: 'REST API Penuh + Webhook Event' },
        ],
    },
    {
        id: 3,
        name: 'Enterprise',
        slug: 'enterprise',
        desc: 'Infrastruktur dedicated dan kustomisasi penuh untuk jaringan distribusi multi-hub skala besar.',
        price: 0,
        is_active: true,
        features: [
            { id: 13, feature_key: 'warehouses', value: 'Gudang & Hub Tidak Terbatas' },
            { id: 14, feature_key: 'users', value: 'Pengguna & Peran Kustom Unlimited' },
            { id: 15, feature_key: 'isolation', value: 'Isolasi Database Tenant Dedicated' },
            { id: 16, feature_key: 'sla', value: 'Jaminan Uptime 99.95% SLA' },
            { id: 17, feature_key: 'support', value: 'Dedicated Account Manager' },
            { id: 18, feature_key: 'integration', value: 'Integrasi Custom ERP / SAP / WMS' },
            { id: 19, feature_key: 'onboarding', value: 'Onboarding & Pelatihan Tim Lapangan' },
        ],
    },
];

export default function PricingSection({ plans = [] }: PricingSectionProps) {
    const [billingAnnual, setBillingAnnual] = useState(false);

    const displayPlans = plans && plans.length >= 3 ? plans : FALLBACK_PLANS;

    const formatPrice = (price: number | string) => {
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice === 0) return 'Custom';
        // Annual discount calculation (e.g. 20% off monthly effective rate)
        const effectiveMonthly = billingAnnual ? Math.round(numericPrice * 0.8) : numericPrice;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        })
            .format(effectiveMonthly)
            .replace('Rp', 'IDR ');
    };

    return (
        <section id="pricing" className="py-28 px-6 bg-slate-50/60 border-t border-slate-200/70 relative overflow-hidden">
            {/* Soft Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-400/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Pilih Paket yang Sesuai dengan Skala Gudang Anda
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base mt-3 leading-relaxed">
                        Mulai dari 1 depot hingga puluhan hub distribusi. Tanpa kontrak tersembunyi, batalkan kapan saja.
                    </p>
                </div>

                {/* Sleek Segmented Toggle pill wrapper (Fixed bug text overlap completely) */}
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-200/60 p-1.5 rounded-2xl inline-flex items-center gap-1 border border-slate-200/80 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setBillingAnnual(false)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                                !billingAnnual
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Tagihan Bulanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingAnnual(true)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none flex items-center gap-2 ${
                                billingAnnual
                                    ? 'bg-[#2B7FFF] text-white shadow-md shadow-blue-500/20'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span>Tagihan Tahunan</span>
                            <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide transition-colors ${
                                    billingAnnual
                                        ? 'bg-white/20 text-white'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}
                            >
                                Hemat 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {displayPlans.map((plan, idx) => {
                        const isPopular = plan.slug === 'pro-plan' || (plans.length === 0 && idx === 1);
                        const isEnterprise = plan.slug === 'enterprise' || Number(plan.price) === 0;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl bg-white flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
                                    isPopular
                                        ? 'border-2 border-[#2B7FFF] shadow-2xl shadow-blue-500/15 ring-4 ring-blue-500/5 z-10'
                                        : 'border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'
                                }`}
                            >
                                {/* Sleek Brand Blue Popular Badge */}
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2B7FFF] to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-1.5 whitespace-nowrap">
                                        <Sparkles size={13} className="text-blue-200" />
                                        <span>Paling Populer</span>
                                    </div>
                                )}

                                <div className="p-8 flex flex-col flex-1">
                                    {/* Header Info */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                                                {plan.name}
                                            </h3>
                                            {isPopular && (
                                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2B7FFF] border border-blue-100">
                                                    Rekomendasi Tim
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                                            {plan.desc || 'Solusi efisien untuk optimalisasi inventaris.'}
                                        </p>
                                    </div>

                                    {/* Price Display */}
                                    <div className="py-6 border-y border-slate-100 mb-6">
                                        {isEnterprise ? (
                                            <div>
                                                <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                                                    Custom
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1.5 font-medium">
                                                    Sesuai jumlah lokasi gudang & kebutuhan SLA
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                                                        {formatPrice(plan.price)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                                                    <span>/ bulan</span>
                                                    {billingAnnual && (
                                                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                                            ditagih tahunan
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feature Items */}
                                    <div className="mb-8 flex-1">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                                            Fitur Termasuk:
                                        </p>
                                        <ul className="space-y-3.5">
                                            {plan.features && plan.features.length > 0 ? (
                                                plan.features.map((feature) => (
                                                    <li
                                                        key={feature.id}
                                                        className="flex items-start gap-3 text-xs font-semibold text-slate-700"
                                                    >
                                                        <span
                                                            className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                                                                isPopular
                                                                    ? 'bg-[#2B7FFF] text-white shadow-sm shadow-blue-500/30'
                                                                    : 'bg-blue-50 text-[#2B7FFF]'
                                                            }`}
                                                        >
                                                            <Check size={10} strokeWidth={3.5} />
                                                        </span>
                                                        <span>{feature.value}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-xs text-slate-400">
                                                    Fitur standar gudang aktif.
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Action CTA Button */}
                                    <Link
                                        href={isEnterprise ? '#' : `/register-tenant?plan_id=${plan.id}`}
                                        className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs text-center transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                                            isPopular
                                                ? 'bg-[#2B7FFF] text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                                                : isEnterprise
                                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                                                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
                                        }`}
                                    >
                                        <span>{isEnterprise ? 'Hubungi Tim Sales' : 'Mulai 14 Hari Gratis'}</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Footer */}
                <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-emerald-500" />
                        Tanpa Kartu Kredit di Awal
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span>Uji Coba Gratis 14 Hari Penuh</span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span>Dukungan Migration Data Gudang Gratis</span>
                </div>
            </div>
        </section>
    );
}

