import { Head } from '@inertiajs/react';

import ProductForm from './components/ProductForm';

interface Product {
    id: number;
    name: string;
    category_id: number | string;
}

interface Props {
    tenant_slug: string;
    product: Product;
}

export default function Edit({
    tenant_slug,
    product,
}: Props) {
    return (
        <>
            <Head title="Edit Product" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Edit Product
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update product information.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <ProductForm
                        tenant_slug={tenant_slug}
                        product={product}
                        mode="edit"
                    />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
        { title: 'Edit Product', href: '#' },
    ],
};