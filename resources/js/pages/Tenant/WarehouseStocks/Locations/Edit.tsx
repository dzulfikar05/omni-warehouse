import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeftCircleIcon, Save, RotateCcw } from 'lucide-react';

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

interface Location {
    id: number;
    warehouse_id: number;
    rack_code: string;
    zone?: string;
    desc?: string;
    is_active: boolean;
}

export default function LocationEdit({
    location,
    warehouses = [],
}: {
    location: Location;
    warehouses: Warehouse[];
}) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, put, processing, errors, reset } = useForm({
        warehouse_id: String(location.warehouse_id || ''),
        rack_code: location.rack_code || '',
        zone: location.zone || '',
        desc: location.desc || '',
        is_active: location.is_active ?? true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/${tenantSlug}/locations/${location.id}`);
    };

    return (
        <>
            <Head title={`Edit Location - ${location.rack_code}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Location Edit Form</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Perbarui detail parameter lokasi rak {location.rack_code}.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/locations`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Gudang Target <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.warehouse_id}
                                onValueChange={(val) => setData('warehouse_id', val)}
                            >
                                <SelectTrigger className="h-10 text-xs rounded-xl border-border bg-background">
                                    <SelectValue placeholder="-- Pilih Gudang Target --" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warehouses.map((wh) => (
                                        <SelectItem key={wh.id} value={String(wh.id)}>
                                            {wh.code} - {wh.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.warehouse_id && (
                                <span className="text-xs text-destructive">{errors.warehouse_id}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="rack_code" className="text-xs font-semibold">
                                    Kode Rak / Slot <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="rack_code"
                                    value={data.rack_code}
                                    onChange={(e) => setData('rack_code', e.target.value.toUpperCase())}
                                    placeholder="Contoh: RACK-A01"
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl font-mono uppercase"
                                />
                                {errors.rack_code && (
                                    <span className="text-xs text-destructive">{errors.rack_code}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="zone" className="text-xs font-semibold">
                                    Nama Zona / Kategori Area
                                </Label>
                                <Input
                                    id="zone"
                                    value={data.zone}
                                    onChange={(e) => setData('zone', e.target.value)}
                                    placeholder="Contoh: Zona Fast Moving"
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.zone && (
                                    <span className="text-xs text-destructive">{errors.zone}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="desc" className="text-xs font-semibold">Deskripsi / Catatan Rak</Label>
                            <Textarea
                                id="desc"
                                rows={3}
                                value={data.desc}
                                onChange={(e) => setData('desc', e.target.value)}
                                placeholder="Keterangan spesifikasi rak atau panduan penataan..."
                                className="text-xs border-border bg-background rounded-xl p-3"
                            />
                            {errors.desc && (
                                <span className="text-xs text-destructive">{errors.desc}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                Status Aktif Digunakan
                            </Label>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => reset()}
                                className="rounded-xl border-border text-xs gap-2"
                            >
                                <RotateCcw size={14} /> Reset
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

LocationEdit.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Rack & Locations', href: '#' },
        { title: 'Edit Location', href: '#' },
    ],
};
