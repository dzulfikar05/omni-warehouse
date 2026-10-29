import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';import { useTranslation } from '@/context/language-context';

import {
    ArrowLeft,
    Pencil,
    Trash2,
    AlertTriangle,
    X,
    Building2,
    Globe,
    Mail,
    Phone,
    FileText,
} from 'lucide-react';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    phone?: string;
    email?: string;
    website?: string;
    tax_number?: string;
    address?: string;
    logo_url?: string;
    users_count?: number;
    created_at?: string;
    updated_at?: string;
    subscription?: {
        status: string;
        plan?: {
            name: string;
        };
    };
}

interface Props {
    tenant: Tenant;
}

export default function TenantShow({ tenant }: Props) {
    const { t } = useTranslation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formattedId = `TNT-${String(tenant.id).padStart(3, '0')}`;
    const planName = tenant.subscription?.plan?.name || 'Standard Plan';
    const subStatus = tenant.subscription?.status ? tenant.subscription.status.toUpperCase() : 'INACTIVE';

    const confirmDelete = () => {
        setIsDeleting(true);
        router.delete(`/tenants/${tenant.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                router.visit('/tenants');
            },
            onError: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title={`Tenant Details - ${tenant.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Tenant Details")}
                    description={`View profile, compliance, and active subscription details for ${tenant.name}.`}
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/tenants">
                                <ArrowLeft className="h-4 w-4" /> {t("Back")}</Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
                    {/* Header Summary */}
                    <div className="flex items-center gap-5 p-6">
                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                            {tenant.logo_url ? (
                                <img src={tenant.logo_url} alt={t("Logo")} className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold text-foreground">{tenant.name}</h2>
                            <p className="font-mono text-xs text-muted-foreground">{t("/")}{tenant.slug} {t("• ID:")}{' '}{formattedId}</p>
                        </div>
                    </div>

                    {/* General Information */}
                    <div className="space-y-4 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {t("Company Contact & Legal")}</h3>
                        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-foreground">{t("Email:")}</span> {tenant.email || '-'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-foreground">{t("Phone:")}</span> {tenant.phone || '-'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-foreground">{t("Website:")}</span>{' '}
                                {tenant.website ? (
                                    <a href={tenant.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                        {tenant.website}
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-foreground">{t("Tax NPWP:")}</span>{' '}
                                <span className="font-mono text-muted-foreground">{tenant.tax_number || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="mb-1 block font-semibold text-foreground">{t("Physical Address:")}</span>
                                <div className="rounded-lg border border-border bg-muted/30 p-3 text-muted-foreground">
                                    {tenant.address || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Metadata */}
                    <div className="space-y-4 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {t("Subscription & Resource Limits")}</h3>
                        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                            <div>
                                <span className="mb-1 block font-semibold text-foreground">{t("Active Plan Tier:")}</span>
                                <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
                                    {planName} {t("(")}{subStatus}{t(")")}</span>
                            </div>
                            <div>
                                <span className="mb-1 block font-semibold text-foreground">{t("Total Users Registered:")}</span>
                                <span className="font-mono font-bold text-foreground">{tenant.users_count || 0} {t("Users")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between bg-muted/30 p-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                        >
                            <Trash2 className="h-4 w-4" /> {t("Delete Tenant")}</Button>

                        <Button asChild size="sm" className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                            <Link href={`/tenants/${tenant.id}/edit`}>
                                <Pencil className="mr-1.5 h-4 w-4" /> {t("Edit Tenant Data")}</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-foreground">{t("Delete Tenant \"")}{tenant.name}{t("\"?")}</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {t("Permanent operation. All databases, active user accounts, and uploaded logos will be wiped from the system.")}</p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isDeleting}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="h-9 border-border text-xs"
                            >
                                {t("Cancel")}</Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={isDeleting}
                                onClick={confirmDelete}
                                className="h-9 bg-red-600 text-white hover:bg-red-700"
                            >
                                {isDeleting ? t("Deleting...") : t("Yes, Delete Tenant")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

TenantShow.layout = {
    breadcrumbs: [
        { title: "Admin", href: '#' },
        { title: "Tenants Management", href: '/tenants' },
        { title: "Tenant Details", href: '#' },
    ],
};
