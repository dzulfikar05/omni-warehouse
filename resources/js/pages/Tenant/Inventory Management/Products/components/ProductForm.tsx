import { Link, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
    id?: number;
    name: string;
    category_id: number | string;
}

interface Props {
    tenant_slug: string;
    product?: Product;
    mode: 'create' | 'edit';
}

export default function ProductForm({
    tenant_slug,
    product,
    mode,
}: Props) {
    const isEdit = mode === 'edit';

    const form = useForm({
        name: product?.name ?? '',
        category_id: product?.category_id ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && product?.id) {
            form.put(
                `/${tenant_slug}/inventory/products/${product.id}`,
            );
        } else {
            form.post(`/${tenant_slug}/inventory/products`);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                >
                    Product Name
                </label>

                <Input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(e) =>
                        form.setData('name', e.target.value)
                    }
                    placeholder="Enter product name"
                />

                {form.errors.name && (
                    <p className="text-sm text-red-500">
                        {form.errors.name}
                    </p>
                )}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label
                    htmlFor="category_id"
                    className="text-sm font-medium text-foreground"
                >
                    Category
                </label>

                <Input
                    id="category_id"
                    type="number"
                    value={form.data.category_id}
                    onChange={(e) =>
                        form.setData('category_id', e.target.value)
                    }
                    placeholder="Enter category ID"
                />

                {form.errors.category_id && (
                    <p className="text-sm text-red-500">
                        {form.errors.category_id}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" asChild>
                    <Link
                        href={`/${tenant_slug}/inventory/products`}
                    >
                        Cancel
                    </Link>
                </Button>

                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Saving...'
                        : isEdit
                          ? 'Update Product'
                          : 'Create Product'}
                </Button>
            </div>
        </form>
    );
}