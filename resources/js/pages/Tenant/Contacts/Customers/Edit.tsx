import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftCircleIcon, Save } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
}

export default function CustomerEdit({ customer }: { customer: Customer }) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        notes: customer.notes || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/${tenantSlug}/contacts/customers/${customer.id}`);
    };

    return (
        <>
            <Head title={`Edit Customer - ${customer.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Edit Customer: <span className="text-blue-600">{customer.name}</span>
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Update customer contact details and information.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/contacts/customers`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Customer Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="h-10 text-xs border-border bg-background rounded-xl"
                            />
                            {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-semibold">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.phone && <span className="text-xs text-destructive">{errors.phone}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-xs font-semibold">Notes</Label>
                            <Textarea
                                id="notes"
                                rows={3}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="text-xs border-border bg-background rounded-xl p-3"
                            />
                            {errors.notes && <span className="text-xs text-destructive">{errors.notes}</span>}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Updating...' : 'Update'}
                            </Button>
                            <Button asChild variant="ghost" className="rounded-xl text-xs">
                                <Link href={`/${tenantSlug}/contacts/customers`}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CustomerEdit.layout = {
    breadcrumbs: [
        { title: 'Contact', href: '#' },
        { title: 'Customer', href: '#' },
        { title: 'Edit Customer', href: '#' },
    ],
};
