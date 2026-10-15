import React from 'react';
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import SkuForm from './components/SkuForm';

interface Product { id: number; name: string; }
interface Unit { id: number; name: string; symbol: string; }
interface Sku {
    id: number;
    product_id: number;
    unit_id: number;
    sku_code: string;
    barcode: string | null;
    base_cost: number;
    current_stock: number;
}

interface Props {
    tenant_slug: string;
    sku: Sku;
    products: Product[];
    units: Unit[];
}

export default function Edit({ tenant_slug, sku, products, units }: Props) {
    return (
        <>
            <Head title={`Edit SKU - ${sku.sku_code}`} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                <PageHeader
                    title={`Edit SKU: ${sku.sku_code}`}
                    description="Perbarui informasi varian produk, harga modal, atau barcode."
                />

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <SkuForm
                        tenant_slug={tenant_slug}
                        sku={sku}
                        products={products}
                        units={units}
                        mode="edit"
                    />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '#' },
        { title: 'Master SKU', href: '#' },
        { title: 'Edit SKU', href: '#' },
    ],
};
