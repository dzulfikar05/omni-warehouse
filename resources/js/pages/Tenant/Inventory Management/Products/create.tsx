import { Head } from '@inertiajs/react';

import ProductForm from './components/ProductForm';

interface Props {
    tenant_slug: string;
}

export default function Create({ tenant_slug }: Props) {
    return (
        <>
            <Head title="Add Product" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Add Product
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create a new product for your inventory.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <ProductForm
                        tenant_slug={tenant_slug}
                        mode="create"
                    />
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '/products' },
        { title: 'Products', href: '/products' },
        { title: 'Add Product', href: '#' },
    ],
};