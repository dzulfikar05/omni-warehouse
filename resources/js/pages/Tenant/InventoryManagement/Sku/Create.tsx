import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeftCircleIcon, Save } from 'lucide-react';

interface Product {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    symbol: string;
}

interface CreateProps {
    products: Product[];
    units: Unit[];
}

export default function SkuCreate({ products, units }: CreateProps) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        unit_id: '',
        sku_code: '',
        barcode: '',
        base_cost: '',
        current_stock: '0',
        min_stock: '5',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/inventory/skus`);
    };

    return (
        <>
            <Head title="Tambah SKU Baru" />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Header */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Tambah SKU Baru
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Buat varian Stock Keeping Unit baru untuk item persediaan gudang.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/inventory/skus`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Product Select */}
                            <div className="space-y-1.5">
                                <Label htmlFor="product_id" className="text-xs font-semibold">
                                    Produk Induk <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.product_id}
                                    onValueChange={(val) => setData('product_id', val)}
                                >
                                    <SelectTrigger className="h-10 text-xs border-border bg-background rounded-xl">
                                        <SelectValue placeholder="Pilih Produk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={String(product.id)}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.product_id && (
                                    <span className="text-xs text-destructive">{errors.product_id}</span>
                                )}
                            </div>

                            {/* Unit Select */}
                            <div className="space-y-1.5">
                                <Label htmlFor="unit_id" className="text-xs font-semibold">
                                    Satuan (Unit) <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.unit_id}
                                    onValueChange={(val) => setData('unit_id', val)}
                                >
                                    <SelectTrigger className="h-10 text-xs border-border bg-background rounded-xl">
                                        <SelectValue placeholder="Pilih Satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={String(unit.id)}>
                                                {unit.name} ({unit.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && (
                                    <span className="text-xs text-destructive">{errors.unit_id}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* SKU Code */}
                            <div className="space-y-1.5">
                                <Label htmlFor="sku_code" className="text-xs font-semibold">
                                    Kode SKU <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="sku_code"
                                    value={data.sku_code}
                                    onChange={(e) => setData('sku_code', e.target.value)}
                                    placeholder="misal: SKU-APP-001"
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl font-mono"
                                />
                                {errors.sku_code && (
                                    <span className="text-xs text-destructive">{errors.sku_code}</span>
                                )}
                            </div>

                            {/* Barcode */}
                            <div className="space-y-1.5">
                                <Label htmlFor="barcode" className="text-xs font-semibold">
                                    Barcode / EAN-13
                                </Label>
                                <Input
                                    id="barcode"
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    placeholder="misal: 8991234567890"
                                    className="h-10 text-xs border-border bg-background rounded-xl font-mono"
                                />
                                {errors.barcode && (
                                    <span className="text-xs text-destructive">{errors.barcode}</span>
                                )}
                            </div>
                        </div>

                        {/* Base Cost */}
                        <div className="space-y-1.5">
                            <Label htmlFor="base_cost" className="text-xs font-semibold">
                                Harga Modal / Base Cost (Rp) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="base_cost"
                                type="number"
                                min="0"
                                value={data.base_cost}
                                onChange={(e) => setData('base_cost', e.target.value)}
                                placeholder="0"
                                required
                                className="h-10 text-xs border-border bg-background rounded-xl font-mono"
                            />
                            {errors.base_cost && (
                                <span className="text-xs text-destructive">{errors.base_cost}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Current Stock */}
                            <div className="space-y-1.5">
                                <Label htmlFor="current_stock" className="text-xs font-semibold">
                                    Stok Awal
                                </Label>
                                <Input
                                    id="current_stock"
                                    type="number"
                                    min="0"
                                    value={data.current_stock}
                                    onChange={(e) => setData('current_stock', e.target.value)}
                                    className="h-10 text-xs border-border bg-background rounded-xl font-mono"
                                />
                                {errors.current_stock && (
                                    <span className="text-xs text-destructive">{errors.current_stock}</span>
                                )}
                            </div>

                            {/* Min Stock */}
                            <div className="space-y-1.5">
                                <Label htmlFor="min_stock" className="text-xs font-semibold">
                                    Stok Minimum (Batas Peringatan)
                                </Label>
                                <Input
                                    id="min_stock"
                                    type="number"
                                    min="0"
                                    value={data.min_stock}
                                    onChange={(e) => setData('min_stock', e.target.value)}
                                    className="h-10 text-xs border-border bg-background rounded-xl font-mono"
                                />
                                {errors.min_stock && (
                                    <span className="text-xs text-destructive">{errors.min_stock}</span>
                                )}
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving...' : 'Save SKU'}
                            </Button>
                            <Button asChild variant="ghost" className="rounded-xl text-xs">
                                <Link href={`/${tenantSlug}/inventory/skus`}>Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

SkuCreate.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '#' },
        { title: 'Master SKU', href: '#' },
        { title: 'Tambah SKU', href: '#' },
    ],
};
