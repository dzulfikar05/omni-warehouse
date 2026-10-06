import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';

interface Unit {
    id: number;
    name: string;
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
    unit: Unit;
    created_at: string;
    updated_at: string;
}

interface Props {
    tenant_slug: string;
    sku: Sku;
}

export default function Show({ tenant_slug, sku }: Props) {
    return (
        <>
            <Head title={`SKU - ${sku.sku_code}`} />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        SKU Details
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        View SKU information.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* SKU Code */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                SKU Code
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {sku.sku_code}
                            </p>
                        </div>

                        {/* Barcode */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Barcode
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {sku.barcode ?? 'N/A'}
                            </p>
                        </div>

                        {/* Base Cost */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Base Cost
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {sku.base_cost}
                            </p>
                        </div>

                        {/* Current Stock */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Current Stock
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {sku.current_stock}
                            </p>
                        </div>

                        {/* Unit */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Unit
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {sku.unit?.name ?? 'N/A'} (
                                {sku.unit?.symbol ?? 'N/A'})
                            </p>
                        </div>

                        {/* Date Added */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Date Added
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    sku.created_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        {/* Last Updated */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    sku.updated_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/skus`}
                            >
                                Back
                            </Link>
                        </Button>

                        <Button asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/skus/${sku.id}/edit`}
                            >
                                Edit SKU
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}