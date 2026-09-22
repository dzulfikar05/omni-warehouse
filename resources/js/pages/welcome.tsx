import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

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

            {/* Light Mode Container dengan Decorative Soft Glows */}
            <div className="relative min-h-screen bg-slate-50/50 text-slate-800 font-sans overflow-hidden">
                {/* Background Blur Glows */}
                <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

                {/* Navbar */}
                <nav className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md fixed top-0 w-full z-50 shadow-xs">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <AppLogo size="sm" tenantName="OmniWarehouse" />
                        </Link>

                        <div className="flex items-center gap-3">
                            <Button
                                asChild
                                variant="ghost"
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                            >
                                <Link href="/register-tenant" className="flex items-center gap-1.5">
                                    <Building2 size={15} className="text-blue-600" /> Register Tenant
                                </Link>
                            </Button>

                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-9 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
                            >
                                <Link href="/login" className="flex items-center gap-1.5">
                                    <ShieldCheck size={15} /> Admin Sign In
                                </Link>
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-48 pb-30 px-6 max-w-5xl mx-auto text-center relative z-10">
                    {/* <div className="mb-6 inline-flex items-center justify-center rounded-3xl bg-white p-5 shadow-xl shadow-slate-200/60 border border-slate-100 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />
                        <AppLogo size="xl" showText={true} />
                    </div> */}
                    <span className=" px-3.5 py-1.5 bg-blue-50 border border-blue-200/60 rounded-full text-blue-700 text-xs font-semibold tracking-wide uppercase shadow-xs">
                        Multi-Tenant SaaS WMS Platform
                    </span>

                    <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Streamline Your Warehouse & Inventory <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            In One Unified Platform
                        </span>
                    </h1>

                    <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Modern warehouse management system featuring strict multi-tenant isolation, real-time inventory tracking, rack location mapping, and flexible role-based access control.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-6 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-98"
                        >
                            <Link href="/register-tenant" className="flex items-center gap-2">
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* Dynamic Pricing Section */}
                <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200/80 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900">Flexible Subscription Plans</h2>
                        <p className="text-slate-500 mt-2 text-sm">Choose the plan that best fits your business operations.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, idx) => {
                            const isPopular = plan.slug === 'pro-plan' || idx === 1;

                            return (
                                <div
                                    key={plan.id}
                                    className={`rounded-2xl p-8 bg-white border transition-all duration-200 flex flex-col justify-between ${
                                        isPopular
                                            ? 'border-blue-600 shadow-xl shadow-blue-600/10 relative ring-1 ring-blue-600/20'
                                            : 'border-slate-200 hover:border-slate-300 shadow-xs'
                                    }`}
                                >
                                    {isPopular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-xs">
                                            Most Popular
                                        </span>
                                    )}

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                        <p className="text-slate-500 text-xs mt-2 min-h-[36px] leading-relaxed">
                                            {plan.desc || 'Optimized for high-volume warehouse operations.'}
                                        </p>

                                        <div className="mt-6 mb-6">
                                            <span className="text-3xl font-extrabold text-slate-900">
                                                {formatPrice(plan.price)}
                                            </span>
                                            {Number(plan.price) > 0 && (
                                                <span className="text-slate-500 text-xs">/month</span>
                                            )}
                                        </div>

                                        <ul className="space-y-3 mb-8">
                                            {plan.features && plan.features.length > 0 ? (
                                                plan.features.map((feature) => (
                                                    <li key={feature.id} className="flex items-center gap-2 text-xs text-slate-600">
                                                        <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                                                        <span>{feature.value}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className="flex items-center gap-2 text-xs text-slate-600">
                                                        <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                                                        Multi-location Warehouse Management
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs text-slate-600">
                                                        <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                                                        Real-time Inventory Tracking
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <Button
                                        asChild
                                        className={`w-full py-2.5 rounded-xl font-semibold text-xs text-center transition-all ${
                                            isPopular
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                        }`}
                                    >
                                        <Link href={`/register-tenant?plan_id=${plan.id}`}>
                                            Get Started
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-xs py-6 text-center text-xs text-slate-500 relative z-10">
                    &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-700">OmniWarehouse SaaS</span>. All rights reserved.
                </footer>
            </div>
        </>
    );
}

// Bypass persistent layout
Welcome.layout = (page: React.ReactNode) => page;
