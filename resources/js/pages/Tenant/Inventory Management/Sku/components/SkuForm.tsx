import React, { FormEvent } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';import { useTranslation } from '@/context/language-context';

import { Check, ArrowLeft } from 'lucide-react';

interface Product { id: number; name: string; }
interface Unit { id: number; name: string; symbol: string; }
interface Sku {
    id?: number;
    product_id: number;
    unit_id: number;
    sku_code: string;
    barcode: string | null;
    base_cost: number;
    current_stock: number;
    min_stock?: number;
}

interface SkuFormProps {
    tenant_slug: string;
    products: Product[];
    units: Unit[];
    sku?: Sku;
    mode: 'create' | 'edit';
}

export default function SkuForm({ tenant_slug, products, units, sku, mode }: SkuFormProps) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors } = useForm({
        product_id: sku ? String(sku.product_id) : '',
        unit_id: sku ? String(sku.unit_id) : '',
        sku_code: sku?.sku_code || '',
        barcode: sku?.barcode || '',
        base_cost: sku?.base_cost || 0,
        current_stock: sku?.current_stock || 0,
        min_stock: sku?.min_stock || 5,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(`/${tenant_slug}/inventory/skus`);
        } else {
            put(`/${tenant_slug}/inventory/skus/${sku?.id}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">
                        {t("Pilih Produk Induk")}{' '}<span className="text-red-500">{t("*")}</span>
                    </Label>
                    <Select value={data.product_id} onValueChange={(val) => setData('product_id', val)}>
                        <SelectTrigger className="h-9 text-xs rounded-xl border-border bg-background">
                            <SelectValue placeholder={t("Pilih Produk")} />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.product_id && <span className="text-destructive text-[11px]">{errors.product_id}</span>}
                </div>

                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">
                        {t("Satuan / Unit")}{' '}<span className="text-red-500">{t("*")}</span>
                    </Label>
                    <Select value={data.unit_id} onValueChange={(val) => setData('unit_id', val)}>
                        <SelectTrigger className="h-9 text-xs rounded-xl border-border bg-background">
                            <SelectValue placeholder={t("Pilih Satuan")} />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>{u.name} {t("(")}{u.symbol}{t(")")}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.unit_id && <span className="text-destructive text-[11px]">{errors.unit_id}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">
                        {t("Kode SKU Unik")}{' '}<span className="text-red-500">{t("*")}</span>
                    </Label>
                    <Input
                        type="text"
                        value={data.sku_code}
                        onChange={(e) => setData('sku_code', e.target.value)}
                        placeholder={t("Cth: SKU-IND-001")}
                        className="h-9 font-mono rounded-xl border-border bg-background"
                    />
                    {errors.sku_code && <span className="text-destructive text-[11px]">{errors.sku_code}</span>}
                </div>

                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">{t("Barcode / EAN-13")}</Label>
                    <Input
                        type="text"
                        value={data.barcode}
                        onChange={(e) => setData('barcode', e.target.value)}
                        placeholder={t("Cth: 8998866200114")}
                        className="h-9 font-mono rounded-xl border-border bg-background"
                    />
                    {errors.barcode && <span className="text-destructive text-[11px]">{errors.barcode}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">
                        {t("Harga Dasar / Base Cost (Rp)")}{' '}<span className="text-red-500">{t("*")}</span>
                    </Label>
                    <Input
                        type="number"
                        value={data.base_cost}
                        onChange={(e) => setData('base_cost', Number(e.target.value))}
                        className="h-9 font-mono rounded-xl border-border bg-background"
                    />
                    {errors.base_cost && <span className="text-destructive text-[11px]">{errors.base_cost}</span>}
                </div>

                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">
                        {t("Stok Awal")}{' '}<span className="text-red-500">{t("*")}</span>
                    </Label>
                    <Input
                        type="number"
                        value={data.current_stock}
                        onChange={(e) => setData('current_stock', Number(e.target.value))}
                        className="h-9 font-mono rounded-xl border-border bg-background"
                    />
                    {errors.current_stock && <span className="text-destructive text-[11px]">{errors.current_stock}</span>}
                </div>

                <div className="space-y-1.5">
                    <Label className="font-semibold text-foreground">{t("Batas Minimum Stok (Alert)")}</Label>
                    <Input
                        type="number"
                        value={data.min_stock}
                        onChange={(e) => setData('min_stock', Number(e.target.value))}
                        className="h-9 font-mono rounded-xl border-border bg-background"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <Button variant="outline" asChild className="h-9 px-4 rounded-xl border-border">
                    <Link href={`/${tenant_slug}/inventory/skus`}>
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {t("Batal")}</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-1.5 shadow-md"
                >
                    <Check className="w-3.5 h-3.5" />
                    <span>{processing ? t("Menyimpan...") : mode === 'create' ? 'Simpan SKU' : 'Perbarui SKU'}</span>
                </Button>
            </div>
        </form>
    );
}
