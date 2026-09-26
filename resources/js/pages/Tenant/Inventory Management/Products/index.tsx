import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
    Plus,
    Search,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    category_id: number;
    created_at: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    tenant_slug: string;
    products: PaginatedProducts;
    filters: {
        search?: string;
    };
}

export default function Index({
    tenant_slug,
    products,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (value: string) => {
        setSearch(value);

        router.get(
            `/${tenant_slug}/inventory/products`,
            {
                search: value || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        router.delete(
            `/${tenant_slug}/inventory/products/${productId}`,
        );
    };

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">
                            Products
                        </h2>

                        <Button asChild className="shadow-md">
                            <Link
                                href={`/${tenant_slug}/inventory/products/create`}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Show</span>

                            <select
                                className="rounded-md border border-border bg-card px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                defaultValue={products.per_page}
                                onChange={(e) => {
                                    router.get(
                                        `/${tenant_slug}/inventory/products`,
                                        {
                                            search: search || undefined,
                                            per_page: e.target.value,
                                        },
                                        {
                                            preserveState: true,
                                            replace: true,
                                        },
                                    );
                                }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>

                            <span>entries</span>
                        </div>

                        <div className="flex w-full items-center space-x-3 md:w-auto">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="flex items-center space-x-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filter</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                    <th className="p-4 font-semibold">
                                        Product ID
                                    </th>

                                    <th className="p-4 font-semibold">
                                        Product Name
                                    </th>

                                    <th className="p-4 font-semibold">
                                        Category
                                    </th>

                                    <th className="p-4 font-semibold">
                                        Date Added
                                    </th>

                                    <th className="p-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 font-medium text-foreground">
                                                {product.id}
                                            </td>

                                            <td className="p-4 text-foreground">
                                                {product.name}
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {product.category_id}
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {new Date(
                                                    product.created_at,
                                                ).toLocaleDateString('en-GB')}
                                            </td>

                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Actions
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-40"
                                                    >
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/${tenant_slug}/inventory/products/${product.id}`}
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/${tenant_slug}/inventory/products/${product.id}/edit`}
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                Edit Data
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                            Delete Data
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                        <div>
                            Page{' '}
                            <span className="font-medium text-foreground">
                                {products.current_page}
                            </span>{' '}
                            of {products.last_page}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={products.current_page === 1}
                                onClick={() =>
                                    router.get(
                                        `/${tenant_slug}/inventory/products`,
                                        {
                                            page:
                                                products.current_page - 1,
                                            search: search || undefined,
                                        },
                                        {
                                            preserveState: true,
                                            replace: true,
                                        },
                                    )
                                }
                            >
                                Prev
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    products.current_page ===
                                    products.last_page
                                }
                                onClick={() =>
                                    router.get(
                                        `/${tenant_slug}/inventory/products`,
                                        {
                                            page:
                                                products.current_page + 1,
                                            search: search || undefined,
                                        },
                                        {
                                            preserveState: true,
                                            replace: true,
                                        },
                                    )
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '/dashboard' },
        { title: 'Products', href: '/products' },
    ],
};