import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';import { useTranslation } from '@/context/language-context';

import { ArrowLeft, ArrowRight, Building2, Mail } from 'lucide-react';

export default function FindTenant() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        tenant: '',
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/find-tenant');
    };

    return (
        <>
            <Head title={t("Find Your Workspace")} />

            {/* Container Outer dengan Adaptasi Light/Dark Mode */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans overflow-hidden transition-colors duration-300 dark:bg-slate-950">
                {/* Back Button di Pojok Kiri Atas */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {t("Back to Home")}</Link>

                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-900/20" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl dark:bg-indigo-900/20" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Title Section */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t("Find Your Workspace")}</h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            {t("Enter your tenant name or workspace slug and registered email address to access your workspace.")}</p>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div className="grid gap-5">
                            {/* Tenant Name/Slug Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="tenant" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    {t("Tenant Name or Workspace Slug")}</Label>
                                <div className="relative">
                                    <Input
                                        id="tenant"
                                        type="text"
                                        name="tenant"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        value={data.tenant}
                                        onChange={(e) => setData('tenant', e.target.value)}
                                        placeholder={t("e.g. acme-corp")}
                                        className="h-11 border-slate-200/80 bg-slate-50/50 pl-3 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-950 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                                    />
                                </div>
                                <InputError message={errors.tenant} />
                            </div>

                            {/* Registered Email Field */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    {t("Registered Email Address")}</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        tabIndex={2}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t("name@company.com")}
                                        className="h-11 border-slate-200/80 bg-slate-50/50 pl-3 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-950 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                tabIndex={3}
                                disabled={processing}
                                className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-950/50"
                            >
                                {processing ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        {t("Continue to Workspace")}<ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Bottom Registration Hint */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {t("Need to create a new organization?")}{' '}
                        <Link href="/register-tenant" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                            {t("Register Workspace")}</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

// Menonaktifkan layout pembungkus bawaan
FindTenant.layout = (page: React.ReactNode) => page;
