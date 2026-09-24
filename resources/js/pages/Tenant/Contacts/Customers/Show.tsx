import React, { useRef, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeftCircleIcon, PencilIcon, Trash2, ArrowRightCircleIcon } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
}

export default function CustomerShow({ customer }: { customer?: Customer }) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Tracker cegah toast ganda
    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    // Fallback Guard jika customer undefined
    if (!customer) {
        return (
            <div className="p-6 text-center text-muted-foreground text-xs">
                Data customer tidak ditemukan.
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
            router.delete(`/${tenantSlug}/contacts/customers/${customer.id}`);
        }
    };

    return (
        <>
            <Head title={`Customer Details - ${customer.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                {/* Top Bar Header */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Customer Details</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kelola data pelanggan, kontak utama, dan riwayat pesanan barang.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/contacts/customers`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 rounded-xl">
                            <Link href={`/${tenantSlug}/warehouse-stocks/outbound/create`}>
                                <ArrowRightCircleIcon className="mr-2 h-4 w-4" /> Add Outbound
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Form Read-Only Data Customer */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-card-foreground">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Customer Name <span className="text-red-500">*</span></Label>
                        <Input value={customer.name || ''} readOnly className="h-10 text-xs border-border bg-muted/30 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Phone <span className="text-red-500">*</span></Label>
                            <Input value={customer.phone || '-'} readOnly className="h-10 text-xs border-border bg-muted/30 rounded-xl" />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email <span className="text-red-500">*</span></Label>
                            <Input value={customer.email || '-'} readOnly className="h-10 text-xs border-border bg-muted/30 rounded-xl" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Notes</Label>
                        <Textarea value={customer.notes || '-'} readOnly rows={3} className="text-xs border-border bg-muted/30 rounded-xl p-3" />
                    </div>

                    {/* Tombol Aksi Edit & Delete */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2">
                            <Link href={`/${tenantSlug}/contacts/customers/${customer.id}/edit`}>
                                <PencilIcon className="h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <Button type="button" variant="outline" onClick={handleDelete} className="text-xs h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl gap-2 border-red-200">
                            <Trash2 size={16} /> Delete
                        </Button>
                    </div>
                </div>

                {/* Section Riwayat Pesanan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Panel Kiri: Outbound / Order History */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">Outbound / Order History</h3>
                        <div className="space-y-3">
                            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">No. 1231241539534</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">SQU-291431932952 | Qty: 21</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        Completed
                                    </span>
                                    <p className="text-[10px] text-muted-foreground mt-1">DC Malang</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel Kanan: Purchased Products */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">Purchased Products</h3>
                        <div className="space-y-3">
                            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">SQU-291431932952</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Beras Kita Rakyat</p>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">Qty Purchased: 500</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

CustomerShow.layout = {
    breadcrumbs: [
        { title: 'Contact', href: '#' },
        { title: 'Customer', href: '#' },
        { title: 'Customer Details', href: '#' },
    ],
};
