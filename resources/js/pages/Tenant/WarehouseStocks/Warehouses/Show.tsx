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
    Layers,
    PackageX,
    Boxes,
    Building2,
} from 'lucide-react';

interface LocationItem {
    id: number;
    rack_code: string;
    zone?: string;
}

interface InventoryStock {
    id: number;
    quantity: number;
    sku?: {
        sku_code: string;
        product?: {
            name: string;
        };
    };
}

interface Warehouse {
    id: number;
    code: string;
    name: string;
    desc?: string;
    is_active: boolean;
    locations?: LocationItem[];
    stocks?: InventoryStock[];
}

export default function WarehouseShow({ warehouse }: { warehouse?: Warehouse }) {
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

    if (!warehouse) {
        return (
            <div className="p-6 text-center text-xs text-muted-foreground">
                Data gudang tidak ditemukan.
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus gudang "${warehouse.name}"?`)) {
            router.delete(`/${tenantSlug}/warehouses/${warehouse.id}`);
        }
    };

    return (
        <>
            <Head title={`Warehouse Details - ${warehouse.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Warehouse Details</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Detail profil fasilitas gudang, area rak penyimpan, dan ketersediaan stok fisik.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/warehouses`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Kode Gudang</Label>
                            <Input
                                value={warehouse.code || ''}
                                readOnly
                                className="h-10 rounded-xl border-border bg-muted/30 text-xs font-mono font-bold text-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Nama Warehouse</Label>
                            <Input
                                value={warehouse.name || ''}
                                readOnly
                                className="h-10 rounded-xl border-border bg-muted/30 text-xs font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Alamat / Deskripsi</Label>
                        <Textarea
                            value={warehouse.desc || '-'}
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
                                    warehouse.is_active
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400'
                                        : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400'
                                }
                            >
                                {warehouse.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border pt-4">
                        <Button
                            asChild
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                        >
                            <Link href={`/${tenantSlug}/warehouses/${warehouse.id}/edit`}>
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
                    {/* Registered Racks & Zones */}
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="border-b border-border pb-3 text-sm font-bold text-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4 text-blue-600" />
                            Registered Racks & Zones
                        </h3>

                        {warehouse.locations && warehouse.locations.length > 0 ? (
                            <div className="space-y-3">
                                {warehouse.locations.map((loc) => (
                                    <div
                                        key={loc.id}
                                        className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-foreground font-mono">
                                                {loc.rack_code}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                Zone: {loc.zone || '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Building2 className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-xs font-medium">Belum ada titik rak/lokasi terdaftar pada gudang ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Stock On Hand */}
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="border-b border-border pb-3 text-sm font-bold text-foreground flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-emerald-600" />
                            Stock On Hand Summary
                        </h3>

                        {warehouse.stocks && warehouse.stocks.length > 0 ? (
                            <div className="space-y-3">
                                {warehouse.stocks.map((stk) => (
                                    <div
                                        key={stk.id}
                                        className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3.5"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-foreground font-mono">
                                                {stk.sku?.sku_code || 'SKU-N/A'}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {stk.sku?.product?.name || '-'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            Qty: {stk.quantity ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <PackageX className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-xs font-medium">Belum ada barang fisik tersimpan pada gudang ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

WarehouseShow.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Warehouses', href: '#' },
        { title: 'Warehouse Details', href: '#' },
    ],
};
