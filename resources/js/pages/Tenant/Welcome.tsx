import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Phone } from 'lucide-react';

interface Props {
    tenant: {
        name: string;
        slug: string;
        phone?: string;
        address?: string;
    };
}

export default function TenantWelcome({ tenant }: Props) {
    const tenantName = tenant?.name || 'Tenant Portal';

    return (
        <>
            <Head title={`${tenantName} - Warehouse Portal`} />

            {/* Container Outer dengan Background Dynamic Light/Dark Mode & Soft Glow */}
            <div className="relative flex min-h-screen flex-col justify-between bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300">
                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-100/50 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-100/40 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

                {/* Navbar */}
                <nav className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 h-16 flex items-center justify-between shadow-xs transition-colors duration-300">
                    <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                        <Link href={`/${tenant?.slug}`} className="flex items-center gap-3">
                            <AppLogo size="sm" tenantName={tenantName} />
                        </Link>

                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium text-xs h-9 px-4 rounded-xl shadow-md shadow-blue-600/20 dark:shadow-blue-950/50 transition-all active:scale-95"
                        >
                            <Link href={`/${tenant?.slug}/login`}>
                                Employee Sign In
                            </Link>
                        </Button>
                    </div>
                </nav>

                {/* Main Hero Section */}
                <main className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
                    {/* Badge Container / App Logo Large */}
                    <div className="mb-6 flex items-center justify-center rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 relative transition-colors duration-300">
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />
                        <AppLogo size="xl" showText={true} />
                    </div>

                    <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/80 rounded-full text-blue-700 dark:text-blue-400 text-xs font-semibold tracking-wide uppercase shadow-xs">
                        Official Warehouse Portal
                    </span>

                    <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {tenantName}
                    </h1>

                    <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
                        Official Operations & Inventory Management Portal powered by OmniWarehouse SaaS.
                    </p>

                    {/* Information Box (Address & Phone) */}
                    {(tenant?.address || tenant?.phone) && (
                        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 px-4 py-2 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs backdrop-blur-xs">
                            {tenant?.address && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    {tenant.address}
                                </span>
                            )}
                            {tenant?.phone && (
                                <span className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                                    <Phone size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    {tenant.phone}
                                </span>
                            )}
                        </div>
                    )}

                    {/* CTA Button */}
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm px-8 py-6 rounded-2xl shadow-lg shadow-blue-600/25 dark:shadow-blue-950/50 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-98"
                        >
                            <Link href={`/${tenant?.slug}/login`} className="flex items-center gap-2">
                                Access Warehouse Dashboard
                                <ArrowRight size={18} />
                            </Link>
                        </Button>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                    &copy; {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-200">{tenantName}</span>. Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">OmniWarehouse</span>.
                </footer>
            </div>
        </>
    );
}

TenantWelcome.layout = (page: React.ReactNode) => page;
