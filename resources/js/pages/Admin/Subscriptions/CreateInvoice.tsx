import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';

interface Tenant {
    id: number;
    name: string;
}

interface Plan {
    id: number;
    name: string;
    price: number;
}

interface Props {
    tenants: Tenant[];
    plans: Plan[];
}

export default function CreateInvoice({ tenants, plans }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        tenant_id: '',
        plan_id: '',
        amount: '',
        due_date: '',
        notes: '',
    });

    const handlePlanChange = (planId: string) => {
        setData((prev) => {
            const selectedPlan = plans.find((p) => p.id.toString() === planId);
            return {
                ...prev,
                plan_id: planId,
                amount: selectedPlan ? selectedPlan.price.toString() : prev.amount,
            };
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/subscriptions/invoices');
    };

    return (
        <>
            <Head title="Create Manual Invoice" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Create Manual Invoice"
                    description="Issue custom or plan-based billing invoices directly to a tenant."
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/admin/subscriptions">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <form onSubmit={submit}>
                        <div className="space-y-6 p-6 border-b border-border">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Tenant Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Tenant Organization <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.tenant_id}
                                        onChange={(e) => setData('tenant_id', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    >
                                        <option value="">-- Select Tenant --</option>
                                        {tenants.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tenant_id && <span className="text-[11px] text-red-500">{errors.tenant_id}</span>}
                                </div>

                                {/* Plan Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Plan Tier (Optional)
                                    </label>
                                    <select
                                        value={data.plan_id}
                                        onChange={(e) => handlePlanChange(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    >
                                        <option value="">-- Select Plan Tier --</option>
                                        {plans.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Rp {Number(p.price).toLocaleString('id-ID')})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.plan_id && <span className="text-[11px] text-red-500">{errors.plan_id}</span>}
                                </div>

                                {/* Amount */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Invoice Amount (IDR) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="750000"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.amount && <span className="text-[11px] text-red-500">{errors.amount}</span>}
                                </div>

                                {/* Due Date */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Due Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.due_date && <span className="text-[11px] text-red-500">{errors.due_date}</span>}
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-foreground">Notes / Instructions</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        placeholder="Add notes for this invoice..."
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.notes && <span className="text-[11px] text-red-500">{errors.notes}</span>}
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
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? 'Issuing...' : 'Issue Invoice'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CreateInvoice.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Subscriptions Management', href: '/admin/subscriptions' },
        { title: 'Create Invoice', href: '#' },
    ],
};
