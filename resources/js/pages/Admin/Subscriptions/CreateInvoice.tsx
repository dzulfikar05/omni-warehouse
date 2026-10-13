import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftCircleIcon, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

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
    const { data, setData, post, processing, errors } = useForm({
        tenant_id: '',
        plan_id: '',
        amount: '',
        due_date: '',
        notes: '',
    });

    // Otomatis mengisi nominal amount berdasarkan plan yang dipilih
    const handlePlanChange = (planId: string) => {
        setData('plan_id', planId);
        const selectedPlan = plans.find(p => p.id.toString() === planId);
        if (selectedPlan) {
            setData('amount', selectedPlan.price.toString());
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/subscriptions/invoices');
    };

    return (
        <>
            <Head title="Create Manual Invoice" />

            <div className="space-y-6 p-4">
                {/* Header Card */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground border border-border p-6 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                Create Manual Invoice
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Terbitkan tagihan manual untuk organisasi tenant tertentu.
                            </p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/admin/subscriptions">
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4" /> Back
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground border border-border p-6 shadow-md">
                    <form onSubmit={submit} className="max-w-xl space-y-4">
                        {/* Pilih Tenant */}
                        <div className="space-y-1">
                            <Label htmlFor="tenant_id">Tenant Organization</Label>
                            <Select onValueChange={(value) => setData('tenant_id', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Pilih Tenant --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tenants.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tenant_id && <span className="text-sm text-red-500">{errors.tenant_id}</span>}
                        </div>

                        {/* Pilih Plan Tier */}
                        <div className="space-y-1">
                            <Label htmlFor="plan_id">Plan Tier (Opsional)</Label>
                            <Select onValueChange={(value) => handlePlanChange(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="-- Pilih Paket Langganan --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name} (Rp {Number(p.price).toLocaleString('id-ID')})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.plan_id && <span className="text-sm text-red-500">{errors.plan_id}</span>}
                        </div>

                        {/* Input Amount */}
                        <div className="space-y-1">
                            <Label htmlFor="amount">Nominal Tagihan (IDR)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="Contoh: 750000"
                            />
                            {errors.amount && <span className="text-sm text-red-500">{errors.amount}</span>}
                        </div>

                        {/* Input Due Date */}
                        <div className="space-y-1">
                            <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                            />
                            {errors.due_date && <span className="text-sm text-red-500">{errors.due_date}</span>}
                        </div>

                        {/* Input Notes */}
                        <div className="space-y-1">
                            <Label htmlFor="notes">Catatan / Keterangan</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Catatan tambahan untuk invoice ini..."
                                rows={3}
                                className="w-full p-3 bg-background border border-input rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            {errors.notes && <span className="text-sm text-red-500">{errors.notes}</span>}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"                                
                                disabled={processing}>
                                <Save className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan & Terbitkan Invoice'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CreateInvoice.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={[
            { title: 'Subscriptions Management', href: '/admin/subscriptions' },
            { title: 'Create Invoice', href: '/admin/subscriptions/create-invoice' },
        ]}
    />
);