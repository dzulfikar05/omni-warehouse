import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircleIcon, Edit3, Package, Layers, Calendar } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import { ProductItem } from './Index';

interface Sku {
    id: number;
    sku_code: string;
    current_stock: number;
    unit?: { symbol: string };
}

interface ProductDetail extends ProductItem {
    skus?: Sku[];
}

export default function ProductShow({ product }: { product: ProductDetail }) {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const canEdit = can('tenant.products.edit') || can('products.edit');

    return (
        <>
            <Head title={`Detail Produk - ${product.name}`} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Card */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {t("Detail Produk:")}{' '}<span className="text-blue-600">{product.name}</span>
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("Rincian produk induk beserta daftar varian SKU yang terhubung.")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/inventory/products`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> {t("Back")}</Link>
                        </Button>
                        {canEdit && (
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md gap-1.5">
                                <Link href={`/${tenantSlug}/inventory/products/${product.id}/edit`}>
                                    <Edit3 className="h-4 w-4" /> {t("Edit Produk")}</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informasional Produk */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" /> {t("Informasi Produk")}</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("ID Produk:")}</span>
                                <strong className="text-blue-600 font-mono text-sm">{t("PRD-00")}{product.id}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[11px]">{t("Status:")}</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg">
                                    {product.status ? product.status.toUpperCase() : t("ACTIVE")}
                                </span>
                            </div>
                        </div>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">{t("Nama Produk Induk:")}</span>
                            <strong className="text-foreground text-sm font-semibold">{product.name}</strong>
                        </div>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">{t("Kategori:")}</span>
                            <span className="px-2 py-0.5 bg-muted border border-border rounded-lg font-medium">
                                {product.category?.name ?? '-'}
                            </span>
                        </div>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">{t("Deskripsi:")}</span>
                            <p className="text-muted-foreground mt-1 leading-relaxed">{product.description || '-'}</p>
                        </div>
                    </div>

                    {/* Varian SKU Terhubung */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" /> {t("Varian SKU Terhubung (")}{product.skus?.length || 0}{t(")")}</h3>

                        <div className="space-y-2">
                            {product.skus && product.skus.length > 0 ? (
                                product.skus.map((sku) => (
                                    <div key={sku.id} className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-xl">
                                        <span className="font-mono font-bold text-blue-600">{sku.sku_code}</span>
                                        <span className="font-mono text-xs">
                                            {t("Stok:")}{' '}<strong>{sku.current_stock}</strong> {sku.unit?.symbol ?? ''}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-4">{t("Belum ada SKU terdaftar untuk produk ini.")}</p>
                            )}
                        </div>

                        <div className="p-4 bg-muted/40 border border-border rounded-xl mt-4">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> {t("Tanggal Dibuat:")}</span>
                                <span className="font-mono text-foreground font-semibold">
                                    {new Date(product.created_at).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ProductShow.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Products", href: '#' },
        { title: "Detail Produk", href: '#' },
    ],
};
