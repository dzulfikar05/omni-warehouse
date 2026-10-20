import React, { useEffect, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Save, RotateCcw, Upload, Building2 } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
}

interface Props {
    plans: Plan[];
}

export default function TenantCreate({ plans }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        phone: '',
        email: '',
        website: '',
        tax_number: '',
        address: '',
        plan_id: plans[0]?.id || '',
        logo: null as File | null,
    });

    useEffect(() => {
        const generatedSlug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setData('slug', generatedSlug);
    }, [data.name]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tenants', { forceFormData: true });
    };

    return (
        <>
            <Head title="Add New Tenant" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Add New Tenant"
                    description="Register a new organization tenant and configure subscription plan."
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/admin/tenants">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Link>
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
                                        <img src={logoPreview} alt="Logo Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-foreground">Company Logo</label>
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
                                        <Upload className="h-3.5 w-3.5" /> Upload Logo
                                    </Button>
                                    <p className="text-[11px] text-muted-foreground">Allowed formats: PNG, JPG, WEBP. Max size: 2MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. PT Demo Logistik"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Slug Identifier <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="demo-tenant"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.slug && <span className="text-[11px] text-red-500">{errors.slug}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Phone Number</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.phone && <span className="text-[11px] text-red-500">{errors.phone}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@demologistik.com"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Website URL</label>
                                    <input
                                        type="url"
                                        value={data.website}
                                        onChange={(e) => setData('website', e.target.value)}
                                        placeholder="https://demologistik.com"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.website && <span className="text-[11px] text-red-500">{errors.website}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Tax Number (NPWP)</label>
                                    <input
                                        type="text"
                                        value={data.tax_number}
                                        onChange={(e) => setData('tax_number', e.target.value)}
                                        placeholder="01.234.567.8-901.000"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.tax_number && <span className="text-[11px] text-red-500">{errors.tax_number}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Subscription Plan <span className="text-red-500">*</span>
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
                                    <label className="text-xs font-semibold text-foreground">Physical Address</label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        placeholder="Enter company full office address..."
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
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700"
                            >
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? 'Saving...' : 'Save Tenant'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

TenantCreate.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Tenants Management', href: '/admin/tenants' },
        { title: 'Add Tenant', href: '#' },
    ],
};
