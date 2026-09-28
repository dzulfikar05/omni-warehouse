import { Link, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category {
    id?: number;
    name: string;
    desc?: string;
}

interface Props {
    tenant_slug: string;
    category?: Category;
    mode: 'create' | 'edit';
}

export default function CategoryForm({
    tenant_slug,
    category,
    mode,
}: Props) {
    const isEdit = mode === 'edit';

    const form = useForm({
        name: category?.name ?? '',
        desc: category?.desc ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && category?.id) {
            form.put(
                `/${tenant_slug}/inventory/categories/${category.id}`,
            );
        } else {
            form.post(`/${tenant_slug}/inventory/categories`);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Category Name */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                >
                    Category Name
                </label>

                <Input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(e) =>
                        form.setData('name', e.target.value)
                    }
                    placeholder="Enter category name"
                />

                {form.errors.name && (
                    <p className="text-sm text-red-500">
                        {form.errors.name}
                    </p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label
                    htmlFor="desc"
                    className="text-sm font-medium text-foreground"
                >
                    Description
                </label>

                <Input
                    id="desc"
                    type="text"
                    value={form.data.desc}
                    onChange={(e) =>
                        form.setData('desc', e.target.value)
                    }
                    placeholder="Enter category description (optional)"
                />

                {form.errors.desc && (
                    <p className="text-sm text-red-500">
                        {form.errors.desc}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" asChild>
                    <Link
                        href={`/${tenant_slug}/inventory/categories`}
                    >
                        Cancel
                    </Link>
                </Button>

                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Saving...'
                        : isEdit
                          ? 'Update Category'
                          : 'Create Category'}
                </Button>
            </div>
        </form>
    );
}