import React, { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Plan {
    id: number;
    name: string;
}

interface Props {
    plans: Plan[];
}

export default function TenantCreate({ plans }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        phone: '',
        plan_id: plans[0]?.id || '',
        address: '',
    });

    // Otomatis generate slug dari name perusahaan
    useEffect(() => {
        const generatedSlug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setData('slug', generatedSlug);
    }, [data.name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tenants');
    };

    return (
        <>
            <Head title="Add New Tenant" />

            <div className="p-6 flex flex-col gap-6 text-foreground min-h-screen bg-background">
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Add New Tenant</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Create a new tenant and assign its subscription plan.
                        </p>
                    </div>

                    <Link
                        href="/admin/tenants"
                        className="h-9 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>

                {/* FORM CARD */}
                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-border space-y-6">
                            <div className="mb-2">
                                <h2 className="text-base font-bold text-foreground">Tenant Information</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Enter the company details and resource plan.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* COMPANY NAME */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Company / Tenant Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter company name"
                                        className="input-field"
                                    />
                                    {errors.name && <span className="text-[11px] text-destructive">{errors.name}</span>}
                                </div>

                                {/* SLUG */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Slug <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="company-slug"
                                        className="input-field font-mono text-muted-foreground"
                                    />
                                    {errors.slug && <span className="text-[11px] text-destructive">{errors.slug}</span>}
                                </div>

                                {/* PHONE */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground">Phone Number</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        className="input-field"
                                    />
                                    {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
                                </div>

                                {/* PLAN */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Subscription Plan <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        value={data.plan_id}
                                        onChange={(e) => setData('plan_id', Number(e.target.value))}
                                        className="input-field"
                                    >
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.plan_id && <span className="text-[11px] text-destructive">{errors.plan_id}</span>}
                                </div>

                                {/* ADDRESS */}
                                <div className="md:col-span-2 flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground">Address</label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                        placeholder="Enter company full address"
                                        className="input-field resize-none"
                                    />
                                    {errors.address && <span className="text-[11px] text-destructive">{errors.address}</span>}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTION */}
                        <div className="p-4 bg-muted/30 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => reset()}
                                disabled={processing}
                                className="h-9 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>

                            <Link
                                href="/admin/tenants"
                                className="h-9 px-4 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="h-9 px-4 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'Saving...' : 'Save Tenant'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

TenantCreate.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={[
            { title: 'Tenants Management', href: '/admin/tenants' },
            { title: 'Add New Tenant', href: '/admin/tenants/create' },
        ]}
    />
);