import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';import { useTranslation } from '@/context/language-context';

import { ArrowLeft, Edit3, Boxes, Tag, Calendar } from 'lucide-react';
import { SkuItem } from './Index';

interface Props {
    tenant_slug: string;
    sku: SkuItem;
}

export default function Show({ tenant_slug, sku }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.permissions || auth?.user?.permissions || [];

    const hasPermission = (permissionName: string) => {
        if (auth?.user?.roles?.some((r: any) => r.name === 'superadmin' || r.name === 'admin')) {
            return true;
        }
        return permissions.includes(permissionName);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <>
            <Head title={`Detail SKU - ${sku.sku_code}`} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                <PageHeader
                    title={`Detail SKU: ${sku.sku_code}`}
                    description={t("Rincian informasi varian barang dan kondisi persediaan terkini.")}
                    renderAction={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild className="h-9 px-4 rounded-xl border-border text-xs">
                                <Link href={`/${tenant_slug}/inventory/skus`}>
                                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> {t("Kembali")}</Link>
                            </Button>
                            {hasPermission('tenant.skus.edit') && (
                                <Button asChild className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md">
                                    <Link href={`/${tenant_slug}/inventory/skus/${sku.id}/edit`}>
                                        <Edit3 className="w-3.5 h-3.5" /> {t("Edit Data SKU")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-600" /> {t("Identitas SKU & Produk")}</h3>

                        <div className="grid grid-cols-2 gap-4 font-mono">
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Kode SKU:")}</span>
                                <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">{sku.sku_code}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Barcode / EAN-13:")}</span>
                                <strong className="text-foreground">{sku.barcode || '-'}</strong>
                            </div>
                        </div>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">{t("Nama Produk Induk:")}</span>
                            <strong className="text-foreground font-sans text-sm">{sku.product?.name ?? '-'}</strong>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Kategori:")}</span>
                                <span className="px-2 py-0.5 bg-muted border border-border rounded-lg font-medium">{sku.product?.category?.name ?? '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Satuan (Unit):")}</span>
                                <strong className="text-foreground font-mono">{sku.unit?.name ?? sku.unit?.symbol ?? '-'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                            <Boxes className="w-4 h-4 text-blue-600" /> {t("Biaya & Persediaan Stok")}</h3>

                        <div className="grid grid-cols-2 gap-4 font-mono">
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Base Cost / HPP:")}</span>
                                <strong className="text-foreground text-sm font-bold">{formatCurrency(sku.base_cost)}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Stok Aktual Saat Ini:")}</span>
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {sku.current_stock} {t("Unit")}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t("Tanggal Dibuat:")}</span>
                                <span className="font-mono text-foreground font-semibold">{new Date(sku.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Master SKU", href: '#' },
        { title: "Detail SKU", href: '#' },
    ],
};
