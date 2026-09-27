import { Head } from '@inertiajs/react';

import CategoryForm from './components/CategoryForm';

interface Category {
    id: number;
    name: string;
    desc?: string;
}

interface Props {
    tenant_slug: string;
    category: Category;
}

export default function Edit({
    tenant_slug,
    category,
}: Props) {
    return (
        <>
            <Head title="Edit Category" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Edit Category
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update category information.
                    </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <CategoryForm
                        tenant_slug={tenant_slug}
                        category={category}
                        mode="edit"
                    />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '/categories' },
        { title: 'Categories', href: '/categories' },
        { title: 'Edit Category', href: '#' },
    ],
};