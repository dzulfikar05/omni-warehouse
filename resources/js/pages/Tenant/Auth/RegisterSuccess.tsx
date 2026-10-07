import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, CheckCircle2, ExternalLink, UserCheck } from 'lucide-react';

interface Props {
    tenant: {
        id: number;
        name: string;
        slug: string;
    };
    user: {
        name: string;
        email: string;
    };
}

export default function RegisterSuccess({ tenant, user }: Props) {
    const tenantUrl = `/${tenant.slug}`;
    const loginUrl = `/${tenant.slug}/login`;

    return (
        <>
            <Head title="Registration Successful" />

            {/* Container Outer dengan Background Soft Blue Glow */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-950 p-4 font-sans overflow-hidden transition-colors duration-300">
                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Success Icon */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/80 shadow-xs">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Company Registered!
                        </h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            Your multi-tenant warehouse environment has been successfully created and configured.
                        </p>
                    </div>

                    {/* Details Box */}
                    <div className="mb-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4 text-left space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/60 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                                <Building2 size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                                    Company
                                </div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {tenant.name}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t border-slate-200/60 dark:border-slate-800 pt-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/60 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                                <UserCheck size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                                    Admin Account
                                </div>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5">
                        <Button
                            asChild
                            className="h-11 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-white shadow-md shadow-blue-600/25 dark:shadow-blue-950/50 transition-all active:scale-[0.99]"
                        >
                            <Link href={loginUrl} className="flex items-center justify-center gap-2">
                                Go to Sign In Portal
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="h-10 w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-xs"
                        >
                            <Link href={tenantUrl} className="flex items-center justify-center gap-1.5">
                                Visit Tenant Public Page ({tenantUrl})
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

RegisterSuccess.layout = (page: React.ReactNode) => page;
