import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, Warehouse } from 'lucide-react';

interface Feature {
    id: number;
    feature_key: string;
    value: string;
}

interface Plan {
    id: number;
    name: string;
    slug: string;
    desc: string | null;
    price: number | string;
    is_active: boolean;
    features?: Feature[];
}

interface Props {
    plans: Plan[];
}

export default function Welcome({ plans = [] }: Props) {
    const formatPrice = (price: number | string) => {
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice === 0) return 'Custom';

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(numericPrice);
    };

    return (
        <>
            <Head title="OmniWarehouse SaaS - Modern Warehouse Management System" />

            <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
                {/* Navbar */}
                <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md fixed top-0 w-full z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                                <Warehouse size={20} />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">OmniWarehouse</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/register-tenant"
                                className="text-sm text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                            >
                                <Building2 size={16} /> Register Tenant
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                            >
                                <ShieldCheck size={16} /> Admin Sign In
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
                    <span className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold tracking-wide uppercase">
                        Multi-Tenant SaaS WMS Platform
                    </span>
                    <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        Streamline Your Warehouse & Inventory <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            In One Unified Platform
                        </span>
                    </h1>
                    <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
                        Modern warehouse management system featuring strict multi-tenant isolation, real-time inventory tracking, rack location mapping, and flexible role-based access control.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/register-tenant"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
                        >
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>

                {/* Dynamic Pricing Section */}
                <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white">Flexible Subscription Plans</h2>
                        <p className="text-slate-400 mt-2 text-sm">Choose the plan that best fits your business operations.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => {
                            const isPopular = plan.slug === 'pro-plan' || idx === 1;

                            return (
                                <div
                                    key={plan.id}
                                    className={`rounded-2xl p-8 bg-slate-900 border transition-all duration-200 flex flex-col justify-between ${
                                        isPopular
                                            ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 relative'
                                            : 'border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    {isPopular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                                            Most Popular
                                        </span>
                                    )}

                                    <div>
                                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                        <p className="text-slate-400 text-xs mt-2 min-h-[36px]">
                                            {plan.desc || 'Optimized for high-volume warehouse operations.'}
                                        </p>

                                        <div className="mt-6 mb-6">
                                            <span className="text-3xl font-extrabold text-white">
                                                {formatPrice(plan.price)}
                                            </span>
                                            {Number(plan.price) > 0 && (
                                                <span className="text-slate-400 text-xs">/month</span>
                                            )}
                                        </div>

                                        <ul className="space-y-3 mb-8">
                                            {plan.features && plan.features.length > 0 ? (
                                                plan.features.map((feature) => (
                                                    <li key={feature.id} className="flex items-center gap-2 text-xs text-slate-300">
                                                        <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                                                        <span>{feature.value}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className="flex items-center gap-2 text-xs text-slate-300">
                                                        <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                                                        Multi-location Warehouse Management
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs text-slate-300">
                                                        <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                                                        Real-time Inventory Tracking
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <Link
                                        href={`/register-tenant?plan_id=${plan.id}`}
                                        className={`w-full py-2.5 rounded-lg font-medium text-xs text-center block transition ${
                                            isPopular
                                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                        }`}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </>
    );
}
