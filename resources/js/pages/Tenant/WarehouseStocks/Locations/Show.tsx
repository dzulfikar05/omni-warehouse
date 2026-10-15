import React, { useRef, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    ArrowLeftCircleIcon,
    PencilIcon,
    Trash2,
    Boxes,
    Clock,
    MapPin,
    PackageX,
    User,
    ArrowDownLeft,
    ArrowUpRight,
} from 'lucide-react';

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

interface Location {
    id: number;
    rack_code: string;
    zone?: string;
    desc?: string;
    is_active: boolean;
    warehouse?: Warehouse;
}

interface StockItem {
    id: number;
    sku_code: string;
    product_name: string;
    quantity: number;
}

interface MovementLog {
    reference_no: string;
    type: string;
    created_at: string;
    sku_code: string;
    product_name: string;
    quantity: number;
    operator_name?: string;
    to_location_id?: number;
}

export default function LocationShow({
    location,
    stocks = [],
    movements = [],
}: {
    location?: Location;
    stocks?: StockItem[];
    movements?: MovementLog[];
}) {
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

    if (!location) {
        return <div className="p-6 text-xs text-muted-foreground">Data lokasi rak tidak ditemukan.</div>;
    }

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus lokasi rak "${location.rack_code}"?`)) {
            router.delete(`/${tenantSlug}/locations/${location.id}`);
        }
    };

    return (
        <>
            <Head title={`Location Details - ${location.rack_code}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Location Details</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Detail spesifikasi lokasi rak, daftar fisik barang tersimpan, dan log riwayat mutasi stok.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/locations`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Kode Rak / Slot</Label>
                            <Input
                                value={location.rack_code || ''}
                                readOnly
                                className="h-10 rounded-xl border-border bg-muted/30 text-xs font-mono font-bold text-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Gudang Target</Label>
                            <Input
                                value={location.warehouse?.name || '-'}
                                readOnly
                                className="h-10 rounded-xl border-border bg-muted/30 text-xs font-bold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Zona Area</Label>
                            <Input
                                value={location.zone || 'General Storage Zone'}
                                readOnly
                                className="h-10 rounded-xl border-border bg-muted/30 text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Deskripsi / Catatan Rak</Label>
                        <Textarea
                            value={location.desc || '-'}
                            readOnly
                            rows={2}
                            className="rounded-xl border-border bg-muted/30 p-3 text-xs"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Status Operasional</Label>
                        <div>
                            <Badge
                                variant="outline"
                                className={
                                    location.is_active
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400'
                                        : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400'
                                }
                            >
                                {location.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border pt-4">
                        <Button
                            asChild
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                        >
                            <Link href={`/${tenantSlug}/locations/${location.id}/edit`}>
                                <PencilIcon className="h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDelete}
                            className="h-9 gap-2 rounded-xl border-red-200 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                            <Trash2 size={16} /> Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Inventory Items on Rack */}
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="border-b border-border pb-3 text-sm font-bold text-foreground flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-emerald-600" />
                            Inventory Items On Rack
                        </h3>

                        {stocks.length > 0 ? (
                            <div className="space-y-3">
                                {stocks.map((stk) => (
                                    <div
                                        key={stk.id}
                                        className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-foreground font-mono">
                                                {stk.sku_code}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {stk.product_name}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                                            Qty: {stk.quantity ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <PackageX className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-xs font-medium">Belum ada barang fisik tersimpan di rak ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Stock Movement Log */}
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="border-b border-border pb-3 text-sm font-bold text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            Stock Movement Log
                        </h3>

                        {movements.length > 0 ? (
                            <div className="space-y-3">
                                {movements.map((log, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3"
                                    >
                                        <div className="mt-0.5">
                                            {log.to_location_id === location.id ? (
                                                <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <ArrowUpRight className="h-4 w-4 text-rose-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-bold text-foreground">
                                                    {log.reference_no}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                <span className="font-mono font-semibold text-primary">{log.sku_code}</span> ({log.quantity} pcs)
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-xs font-medium">Belum ada riwayat pergerakan stok di rak ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

LocationShow.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Rack & Locations', href: '#' },
        { title: 'Location Details', href: '#' },
    ],
};
