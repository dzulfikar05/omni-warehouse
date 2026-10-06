import { Head } from '@inertiajs/react';

import SkuForm from './components/SkuForm';

interface Product {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    symbol: string;
}

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

export default function Edit({
    tenant_slug,
    sku,
    products,
    units,
}: Props) {
    return (
        <>
            <Head title="Edit SKU" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Edit SKU
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update SKU information.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
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
        { title: 'Inventory Management', href: '/skus' },
        { title: 'SKUs', href: '/skus' },
        { title: 'Edit SKU', href: '#' },
    ],
};