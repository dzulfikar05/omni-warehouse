import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftCircleIcon, Save, RotateCcw } from 'lucide-react';

export default function WarehouseCreate() {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        desc: '',
        is_active: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/warehouses`);
    };

    return (
        <>
            <Head title="Add New Warehouse" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Warehouse Add Form</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Daftarkan fasilitas gudang baru untuk manajemen stok dan lokasi penyimpanan.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/warehouses`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="code" className="text-xs font-semibold">
                                    Kode Gudang <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="Contoh: WH-JKT01"
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl font-mono"
                                />
                                {errors.code && <span className="text-xs text-destructive">{errors.code}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold">
                                    Nama Warehouse <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Gudang Utama Jakarta"
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="desc" className="text-xs font-semibold">Alamat / Deskripsi</Label>
                            <Textarea
                                id="desc"
                                rows={3}
                                value={data.desc}
                                onChange={(e) => setData('desc', e.target.value)}
                                placeholder="Alamat lengkap atau keterangan fasilitas gudang..."
                                className="text-xs border-border bg-background rounded-xl p-3"
                            />
                            {errors.desc && <span className="text-xs text-destructive">{errors.desc}</span>}
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
                                Status Aktif Beroperasi
                            </Label>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save'}
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

WarehouseCreate.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Warehouses', href: '#' },
        { title: 'Add Warehouse', href: '#' },
    ],
};
