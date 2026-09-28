import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';

interface Product {
    category: any;
    id: number;
    name: string;
    category_id: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    tenant_slug: string;
    product: Product;
}

export default function Show({
    tenant_slug,
    product,
}: Props) {
    return (
        <>
            <Head title={`Product - ${product.name}`} />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Product Details
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        View product information.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Product ID
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {product.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Product Name
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {product.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Category
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {product.category?.name || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Date Added
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    product.created_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    product.updated_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/products`}
                            >
                                Back
                            </Link>
                        </Button>

                        <Button asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/products/${product.id}/edit`}
                            >
                                Edit Product
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}