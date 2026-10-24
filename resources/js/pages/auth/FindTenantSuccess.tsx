import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, ExternalLink, Building2, Mail, Hash } from 'lucide-react';

interface Props {
    tenant: {
        id: number;
        name: string;
        slug: string;
        login_url: string;
    };
    email: string;
}

export default function FindTenantSuccess({ tenant, email }: Props) {
    return (
        <>
            <Head title="Workspace Verified" />

            {/* Container Outer dengan Adaptasi Light/Dark Mode */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans overflow-hidden transition-colors duration-300 dark:bg-slate-950">
                {/* Back Button di Pojok Kiri Atas */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Back to Home
                </Link>

                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl dark:bg-emerald-900/20" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl dark:bg-indigo-900/20" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600" />

                    {/* Header Logo & Icon Section */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Workspace Found!
                        </h1>

                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            We verified your account access for the requested organization workspace.
                        </p>
                    </div>

                    {/* Verified Details Card */}
                    <div className="mb-6 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950/50">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                Tenant Name
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">{tenant.name}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                <Hash className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                Workspace Slug
                            </span>
                            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{tenant.slug}</span>
                        </div>

                        <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-2.5 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                Verified Email
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <a
                            href={tenant.login_url}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-950/50 text-xs"
                        >
                            Proceed to Login Console
                            <ExternalLink className="h-4 w-4" />
                        </a>

                        <Link
                            href="/find-tenant"
                            className="inline-flex h-10 w-full items-center justify-center text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            Search Another Workspace
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

// Menonaktifkan layout pembungkus bawaan
FindTenantSuccess.layout = (page: React.ReactNode) => page;
