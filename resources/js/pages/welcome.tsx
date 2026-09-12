import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, Warehouse } from 'lucide-react';

export default function Welcome() {
    const plans = [
        {
            name: 'Basic Plan',
            price: '$15',
            period: '/month',
            desc: 'Ideal for small businesses managing a single warehouse location.',
            features: ['1 Warehouse Location', 'Up to 500 SKUs', 'Basic Stock In/Out', '2 User Accounts'],
        },
        {
            name: 'Pro Plan',
            price: '$35',
            period: '/month',
            popular: true,
            desc: 'Comprehensive solution for mid-sized logistics operations.',
            features: ['Unlimited Warehouses', 'Unlimited SKUs', 'Batch & Expiry Tracking', 'Multi-role & Permissions', 'Transaction History Export'],
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            desc: 'Dedicated infrastructure with custom business feature integrations.',
            features: ['Dedicated Infrastructure', 'Custom API Integrations', 'SLA 99.9% Uptime', '24/7 Priority Support'],
        },
    ];

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
                                href="/demo-tenant/login"
                                className="text-sm text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                            >
                                <Building2 size={16} /> Tenant Portal
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
                            href="/demo-tenant/login"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
                        >
                            Try Demo Tenant <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white">Flexible Subscription Plans</h2>
                        <p className="text-slate-400 mt-2 text-sm">Choose the plan that best fits your business operations.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((p, idx) => (
                            <div
                                key={idx}
                                className={`rounded-2xl p-8 bg-slate-900 border ${
                                    p.popular ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 relative' : 'border-slate-800'
                                }`}
                            >
                                {p.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                                <p className="text-slate-400 text-xs mt-2 min-h-[36px]">{p.desc}</p>
                                <div className="mt-6 mb-6">
                                    <span className="text-3xl font-extrabold text-white">{p.price}</span>
                                    <span className="text-slate-400 text-xs">{p.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {p.features.map((f, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                            <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/demo-tenant/login"
                                    className={`w-full py-2.5 rounded-lg font-medium text-xs text-center block transition ${
                                        p.popular
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                    }`}
                                >
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
