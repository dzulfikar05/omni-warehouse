import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Building2, LogIn, Warehouse } from 'lucide-react';

interface Props {
    tenant: {
        name: string;
        slug: string;
        phone?: string;
        address?: string;
    };
}

export default function TenantWelcome({ tenant }: Props) {
    return (
        <>
            <Head title={`${tenant?.name || 'Tenant Portal'} - Warehouse System`} />

            <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
                {/* Navbar */}
                <nav className="border-b border-slate-800 bg-slate-950/40 px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
                            <Warehouse size={18} />
                        </div>
                        <span className="font-bold text-base text-white">{tenant?.name}</span>
                    </div>

                    <Link
                        href={`/${tenant?.slug}/login`}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                    >
                        <LogIn size={14} /> Employee Sign In
                    </Link>
                </nav>

                {/* Main Section */}
                <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Building2 size={32} />
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {tenant?.name}
                    </h1>
                    <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
                        Official Operations & Inventory Management Portal powered by OmniWarehouse SaaS.
                    </p>

                    {tenant?.address && (
                        <p className="text-xs text-slate-500 mt-2">
                            📍 {tenant.address}
                        </p>
                    )}

                    <div className="mt-8">
                        <Link
                            href={`/${tenant?.slug}/login`}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition"
                        >
                            Access Warehouse Dashboard
                        </Link>
                    </div>
                </main>

                <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} {tenant?.name}. Powered by OmniWarehouse.
                </footer>
            </div>
        </>
    );
}

// ⚠️ Mencegah Inertia membungkus halaman ini dengan AppLayout (AppSidebar)
TenantWelcome.layout = (page: React.ReactNode) => page;
