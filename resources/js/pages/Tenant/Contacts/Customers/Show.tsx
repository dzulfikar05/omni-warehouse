import React, { useRef, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeftCircleIcon, PencilIcon, Trash2, ArrowRightCircleIcon, ShoppingBag, PackageX } from 'lucide-react';

interface TransactionItem {
    id: number;
    quantity: number;
    sku?: {
        sku_code: string;
        product?: {
            name: string;
        };
    };
}

interface OutboundTransaction {
    id: number;
    local_uuid?: string;
    status?: string;
    created_at?: string;
    items?: TransactionItem[];
}

interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    address?: string;
    notes?: string;
    outbounds?: OutboundTransaction[];
    purchased_products?: TransactionItem[];
}

export default function CustomerShow({ customer }: { customer?: Customer }) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    if (!customer) {
        return (
            <div className="p-6 text-center text-xs text-muted-foreground">
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
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Customer Details</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Kelola data pelanggan, kontak utama, dan riwayat pesanan barang.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/contacts/customers`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
                            <Link href={`/${tenantSlug}/warehouse-stocks/outbound/create?customer_id=${customer.id}`}>
                                <ArrowRightCircleIcon className="mr-2 h-4 w-4" /> Add Outbound
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Customer Name</Label>
                        <Input value={customer.name || ''} readOnly className="h-10 rounded-xl border-border bg-muted/30 text-xs" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Phone</Label>
                            <Input value={customer.phone || '-'} readOnly className="h-10 rounded-xl border-border bg-muted/30 text-xs" />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email</Label>
                            <Input value={customer.email || '-'} readOnly className="h-10 rounded-xl border-border bg-muted/30 text-xs" />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Tax Number / NPWP</Label>
                            <Input value={customer.tax_number || '-'} readOnly className="h-10 rounded-xl border-border bg-muted/30 text-xs font-mono" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Address</Label>
                        <Textarea value={customer.address || '-'} readOnly rows={2} className="rounded-xl border-border bg-muted/30 p-3 text-xs" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Notes</Label>
                        <Textarea value={customer.notes || '-'} readOnly rows={3} className="rounded-xl border-border bg-muted/30 p-3 text-xs" />
                    </div>

                    <div className="flex items-center gap-3 border-t border-border pt-4">
                        <Button asChild className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700">
                            <Link href={`/${tenantSlug}/contacts/customers/${customer.id}/edit`}>
                                <PencilIcon className="h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <Button type="button" variant="outline" onClick={handleDelete} className="h-9 gap-2 rounded-xl border-red-200 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
                            <Trash2 size={16} /> Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="border-b border-border pb-3 text-sm font-bold text-foreground">Outbound / Order History</h3>

                        {customer.outbounds && customer.outbounds.length > 0 ? (
                            <div className="space-y-3">
                                {customer.outbounds.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5">
                                        <div>
                                            <p className="text-xs font-bold text-foreground">TRX-{item.local_uuid || item.id}</p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {new Date(item.created_at || '').toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                item.status === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                            }`}>
                                                {item.status ? item.status.toUpperCase() : 'COMPLETED'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-xs font-medium">Belum ada riwayat order/outbound untuk customer ini.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="border-b border-border pb-3 text-sm font-bold text-foreground">Purchased Products</h3>

                        {customer.purchased_products && customer.purchased_products.length > 0 ? (
                            <div className="space-y-3">
                                {customer.purchased_products.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5">
                                        <div>
                                            <p className="text-xs font-bold text-foreground">{item.sku?.sku_code || 'SKU-N/A'}</p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.sku?.product?.name || '-'}</p>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Qty Purchased: {item.quantity ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <PackageX className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-xs font-medium">Belum ada daftar produk yang pernah dibeli oleh customer ini.</p>
                            </div>
                        )}
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
