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

interface Props {
    tenant_slug: string;
    products: Product[];
    units: Unit[];
}

export default function Create({
    tenant_slug,
    products,
    units,
}: Props) {
    return (
        <>
            <Head title="Add SKU" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Add SKU
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create a new SKU for your inventory.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
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
        { title: 'Inventory Management', href: '/skus' },
        { title: 'SKUs', href: '/skus' },
        { title: 'Add SKU', href: '#' },
    ],
};