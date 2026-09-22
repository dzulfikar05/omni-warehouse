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
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 p-4 font-sans overflow-hidden">
                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Success Icon */}
                    <div className="mb-6 text-center">
                        {/* <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div> */}

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Company Registered!
                        </h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 px-2">
                            Your multi-tenant warehouse environment has been successfully created and configured.
                        </p>
                    </div>

                    {/* Details Box */}
                    <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/60 text-blue-600 shrink-0">
                                <Building2 size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                    Company
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {tenant.name}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t border-slate-200/60 pt-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/60 text-blue-600 shrink-0">
                                <UserCheck size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                    Admin Account
                                </div>
                                <div className="text-sm font-medium text-slate-700">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5">
                        <Button
                            asChild
                            className="h-11 w-full bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99]"
                        >
                            <Link href={loginUrl} className="flex items-center justify-center gap-2">
                                Go to Sign In Portal
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="h-10 w-full border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs"
                        >
                            <Link href={tenantUrl} className="flex items-center justify-center gap-1.5">
                                Visit Tenant Public Page ({tenantUrl})
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

RegisterSuccess.layout = (page: React.ReactNode) => page;
