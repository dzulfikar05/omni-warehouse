import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircleIcon, Edit3, FolderTree, Package, Calendar } from 'lucide-react';
import { usePermission } from '@/utils/permission';
import { CategoryItem } from './Index';

interface Product {
    id: number;
    name: string;
}

interface CategoryDetail extends CategoryItem {
    products?: Product[];
}

export default function CategoryShow({ category }: { category: CategoryDetail }) {
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const canEdit = can('tenant.categories.edit') || can('categories.edit');

    return (
        <>
            <Head title={`Category Details - ${category.name}`} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Card */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Category Details: <span className="text-blue-600">{category.name}</span>
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            View details and associated products within this category.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/inventory/categories`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md gap-1.5">
                                <Link href={`/${tenantSlug}/inventory/categories/${category.id}/edit`}>
                                    <Edit3 className="h-4 w-4" /> Edit Category
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Info Panel */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                            <FolderTree className="w-4 h-4 text-blue-600" /> Category Details
                        </h3>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">Category ID:</span>
                            <strong className="text-blue-600 font-mono text-sm">CAT-00{category.id}</strong>
                        </div>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">Category Name:</span>
                            <strong className="text-foreground text-sm font-semibold">{category.name}</strong>
                        </div>

                        <div>
                            <span className="text-muted-foreground block text-[11px]">Description:</span>
                            <p className="text-muted-foreground mt-1 leading-relaxed">{category.desc || '-'}</p>
                        </div>
                    </div>

                    {/* Associated Products Panel */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" /> Associated Products ({category.products_count || 0})
                        </h3>

                        <div className="space-y-2">
                            {category.products && category.products.length > 0 ? (
                                category.products.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-xl">
                                        <span className="font-medium text-foreground">{product.name}</span>
                                        <span className="font-mono text-[11px] text-blue-600">PRD-00{product.id}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No products currently assigned to this category.</p>
                            )}
                        </div>

                        <div className="p-4 bg-muted/40 border border-border rounded-xl mt-4">
                            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" /> Date Created:
                                </span>
                                <span className="font-mono text-foreground font-semibold">
                                    {new Date(category.created_at).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

CategoryShow.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '#' },
        { title: 'Categories', href: '#' },
        { title: 'Category Details', href: '#' },
    ],
};
