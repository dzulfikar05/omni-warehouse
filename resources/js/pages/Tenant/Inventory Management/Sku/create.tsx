import React from 'react';
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';import { useTranslation } from '@/context/language-context';

import SkuForm from './components/SkuForm';

interface Product { id: number; name: string; }
interface Unit { id: number; name: string; symbol: string; }

interface Props {
    tenant_slug: string;
    products: Product[];
    units: Unit[];
}

export default function Create({ tenant_slug, products, units }: Props) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t("Tambah SKU Baru")} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                <PageHeader
                    title={t("Tambah SKU Baru")}
                    description={t("Buat varian baru untuk produk inventory beserta acuan HPP dan barcode.")}
                />

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <SkuForm
                        tenant_slug={tenant_slug}
                        products={products}
                        units={units}
                        mode="create"
                    />
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Master SKU", href: '#' },
        { title: "Tambah SKU", href: '#' },
    ],
};
