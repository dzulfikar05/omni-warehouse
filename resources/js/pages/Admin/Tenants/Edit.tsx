import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';import { useTranslation } from '@/context/language-context';

import { ArrowLeft, Save, RotateCcw, Upload, Building2 } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
}

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
    subscription?: {
        plan_id?: number;
    };
}

interface Props {
    tenant: Tenant;
    plans: Plan[];
}

export default function TenantEdit({ tenant, plans }: Props) {
    const { t } = useTranslation();
    const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url || null);

    const { data, setData, processing, errors, reset } = useForm({
        name: tenant.name || '',
        slug: tenant.slug || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        website: tenant.website || '',
        tax_number: tenant.tax_number || '',
        address: tenant.address || '',
        plan_id: tenant.subscription?.plan_id || plans[0]?.id || '',
        logo: null as File | null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/tenants/${tenant.id}`, {
            _method: 'PUT',
            ...data,
        });
    };

    return (
        <>
            <Head title={`Edit Tenant - ${tenant.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Edit Tenant Data")}
                    description={`Modify organization records and active subscription plan for ${tenant.name}.`}
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/tenants">
                                <ArrowLeft className="h-4 w-4" /> {t("Back")}</Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 p-6 border-b border-border">
                            {/* Logo Upload */}
                            <div className="flex items-center gap-5">
                                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt={t("Logo Preview")} className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-foreground">{t("Company Logo")}</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="logo-upload"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5 border-border text-xs"
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                    >
                                        <Upload className="h-3.5 w-3.5" /> {t("Change Logo")}</Button>
                                    <p className="text-[11px] text-muted-foreground">{t("Allowed formats: PNG, JPG, WEBP. Max size: 2MB.")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        {t("Company Name")}{' '}<span className="text-red-500">{t("*")}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        {t("Slug Identifier")}{' '}<span className="text-red-500">{t("*")}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.slug && <span className="text-[11px] text-red-500">{errors.slug}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">{t("Phone Number")}</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.phone && <span className="text-[11px] text-red-500">{errors.phone}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">{t("Email Address")}</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">{t("Website URL")}</label>
                                    <input
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.website && <span className="text-[11px] text-red-500">{errors.website}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">{t("Tax Number (NPWP)")}</label>
                                    <input
                                        type="text"
                                        value={data.tax_number}
                                        onChange={(e) => setData('tax_number', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.tax_number && <span className="text-[11px] text-red-500">{errors.tax_number}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        {t("Subscription Plan")}{' '}<span className="text-red-500">{t("*")}</span>
                                    </label>
                                    <select
                                        value={data.plan_id}
                                        onChange={(e) => setData('plan_id', Number(e.target.value))}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    >
                                        {plans.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.plan_id && <span className="text-[11px] text-red-500">{errors.plan_id}</span>}
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-foreground">{t("Physical Address")}</label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.address && <span className="text-[11px] text-red-500">{errors.address}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 bg-muted/30 p-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={processing}
                                onClick={() => reset()}
                                className="h-9 gap-1.5 border-border text-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> {t("Reset")}</Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700"
                            >
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? t("Updating...") : t("Update Changes")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

TenantEdit.layout = {
    breadcrumbs: [
        { title: "Admin", href: '#' },
        { title: "Tenants Management", href: '/tenants' },
        { title: "Edit Tenant", href: '#' },
    ],
};
