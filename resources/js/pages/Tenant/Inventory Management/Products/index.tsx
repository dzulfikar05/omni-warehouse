import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

import {
    Plus,
    Search,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
    X,
} from 'lucide-react';
import debounce from 'lodash/debounce';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    category_id: number;
    category?: Category;
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
    categories: Category[]; // Props baru untuk opsi filter kategori
    filters: {
        search?: string;
        category_id?: string;
        sort_by?: string;
        per_page?: string;
    };
}

export default function Index({
    tenant_slug,
    products,
    categories = [],
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? '');
    const [sortBy, setSortBy] = useState(filters.sort_by ?? 'latest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Helper untuk mengirim request navigasi Inertia
    const updateQueryParams = (newParams: Record<string, any>) => {
        const queryParams = {
            search: search || undefined,
            category_id: categoryId || undefined,
            sort_by: sortBy !== 'latest' ? sortBy : undefined,
            per_page: products.per_page,
            ...newParams,
        };

        router.get(
            `/${tenant_slug}/inventory/products`,
            queryParams,
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Debounce pencarian
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            updateQueryParams({ search: value || undefined, page: 1 });
        }, 400),
        [tenant_slug, categoryId, sortBy, products.per_page]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateQueryParams({ per_page: e.target.value, page: 1 });
    };

    const handlePagination = (page: number) => {
        updateQueryParams({ page });
    };

    const handleApplyFilter = () => {
        updateQueryParams({
            category_id: categoryId || undefined,
            sort_by: sortBy !== 'latest' ? sortBy : undefined,
            page: 1,
        });
        setIsFilterOpen(false);
    };

    const handleResetFilter = () => {
        setCategoryId('');
        setSortBy('latest');
        updateQueryParams({
            category_id: undefined,
            sort_by: undefined,
            page: 1,
        });
        setIsFilterOpen(false);
    };

    const handleDelete = (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        router.delete(
            `/${tenant_slug}/inventory/products/${productId}`
        );
    };

    const isFilterActive = Boolean(filters.category_id || (filters.sort_by && filters.sort_by !== 'latest'));

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
                                value={products.per_page}
                                onChange={handlePerPageChange}
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
                                    onChange={handleSearchChange}
                                    className="pl-9"
                                />
                            </div>

                            {/* Filter Popover */}
                            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={isFilterActive ? "default" : "outline"}
                                        className="relative flex items-center space-x-2"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <span>Filter</span>
                                        {isFilterActive && (
                                            <span className="ml-1 rounded-full bg-primary-foreground text-primary px-1.5 py-0.5 text-xs font-bold">
                                                •
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h4 className="font-semibold text-sm">Filter Products</h4>
                                            {isFilterActive && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleResetFilter}
                                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    Reset
                                                </Button>
                                            )}
                                        </div>

                                        {/* Filter Kategori */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                Category
                                            </label>
                                            <select
                                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Filter Urutan / Sort */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground">
                                                Sort By
                                            </label>
                                            <select
                                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="latest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="name_asc">Name (A-Z)</option>
                                                <option value="name_desc">Name (Z-A)</option>
                                            </select>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-2 pt-2 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsFilterOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleApplyFilter}>
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
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
                                        Category Name
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
                                                PRD-00{product.id}
                                            </td>

                                            <td className="p-4 text-foreground">
                                                {product.name}
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {product.category?.name || 'N/A'}
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {new Date(
                                                    product.created_at
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
                                                                    product.id
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
                                    handlePagination(
                                        products.current_page - 1
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
                                    handlePagination(
                                        products.current_page + 1
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