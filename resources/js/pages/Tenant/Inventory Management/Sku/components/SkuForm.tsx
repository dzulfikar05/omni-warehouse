import { Link, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    symbol: string;
}

interface Sku {
    id?: number;
    product_id: number;
    unit_id: number;
    sku_code: string;
    barcode: string | null;
    base_cost: number;
    current_stock: number;
}

interface Props {
    tenant_slug: string;
    sku?: Sku;
    products: Product[];
    units: Unit[];
    mode: 'create' | 'edit';
}

export default function SkuForm({
    tenant_slug,
    sku,
    products,
    units,
    mode,
}: Props) {
    const isEdit = mode === 'edit';

    const form = useForm({
        sku_code: sku?.sku_code ?? '',
        barcode: sku?.barcode ?? '',
        product_id: sku?.product_id ?? 0,
        unit_id: sku?.unit_id ?? 0,
        base_cost: sku?.base_cost ?? 0,
        current_stock: sku?.current_stock ?? 0,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && sku?.id) {
            form.put(`/${tenant_slug}/inventory/skus/${sku.id}`);
        } else {
            form.post(`/${tenant_slug}/inventory/skus`);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Product */}
            <div className="space-y-2">
                <label
                    htmlFor="product_id"
                    className="text-sm font-medium text-foreground"
                >
                    Product
                </label>

                <select
                    id="product_id"
                    value={form.data.product_id}
                    onChange={(e) =>
                        form.setData('product_id', Number(e.target.value))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value={0}>Select product</option>

                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>

                {form.errors.product_id && (
                    <p className="text-sm text-red-500">
                        {form.errors.product_id}
                    </p>
                )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
                <label
                    htmlFor="unit_id"
                    className="text-sm font-medium text-foreground"
                >
                    Unit
                </label>

                <select
                    id="unit_id"
                    value={form.data.unit_id}
                    onChange={(e) =>
                        form.setData('unit_id', Number(e.target.value))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value={0}>Select unit</option>

                    {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                            {unit.symbol}
                        </option>
                    ))}
                </select>

                {form.errors.unit_id && (
                    <p className="text-sm text-red-500">
                        {form.errors.unit_id}
                    </p>
                )}
            </div>

            {/* SKU Code */}
            <div className="space-y-2">
                <label
                    htmlFor="sku_code"
                    className="text-sm font-medium text-foreground"
                >
                    SKU Code
                </label>

                <Input
                    id="sku_code"
                    type="text"
                    value={form.data.sku_code}
                    onChange={(e) =>
                        form.setData('sku_code', e.target.value)
                    }
                    placeholder="Enter SKU code"
                />

                {form.errors.sku_code && (
                    <p className="text-sm text-red-500">
                        {form.errors.sku_code}
                    </p>
                )}
            </div>

            {/* Barcode */}
            <div className="space-y-2">
                <label
                    htmlFor="barcode"
                    className="text-sm font-medium text-foreground"
                >
                    Barcode
                </label>

                <Input
                    id="barcode"
                    type="text"
                    value={form.data.barcode}
                    onChange={(e) =>
                        form.setData('barcode', e.target.value)
                    }
                    placeholder="Enter barcode"
                />

                {form.errors.barcode && (
                    <p className="text-sm text-red-500">
                        {form.errors.barcode}
                    </p>
                )}
            </div>

            {/* Base Cost */}
            <div className="space-y-2">
                <label
                    htmlFor="base_cost"
                    className="text-sm font-medium text-foreground"
                >
                    Base Cost
                </label>

                <Input
                    id="base_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.data.base_cost}
                    onChange={(e) =>
                        form.setData(
                            'base_cost',
                            e.target.value === ''
                                ? 0
                                : parseFloat(e.target.value),
                        )
                    }
                    placeholder="Enter base cost"
                />

                {form.errors.base_cost && (
                    <p className="text-sm text-red-500">
                        {form.errors.base_cost}
                    </p>
                )}
            </div>

            {/* Current Stock */}
            <div className="space-y-2">
                <label
                    htmlFor="current_stock"
                    className="text-sm font-medium text-foreground"
                >
                    Current Stock
                </label>

                <Input
                    id="current_stock"
                    type="number"
                    min="0"
                    value={form.data.current_stock}
                    onChange={(e) =>
                        form.setData(
                            'current_stock',
                            e.target.value === ''
                                ? 0
                                : parseInt(e.target.value, 10),
                        )
                    }
                    placeholder="Enter current stock"
                />

                {form.errors.current_stock && (
                    <p className="text-sm text-red-500">
                        {form.errors.current_stock}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" asChild>
                    <Link href={`/${tenant_slug}/inventory/skus`}>
                        Cancel
                    </Link>
                </Button>

                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Saving...'
                        : isEdit
                          ? 'Update SKU'
                          : 'Create SKU'}
                </Button>
            </div>
        </form>
    );
}