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
} from 'lucide-react';
import debounce from 'lodash/debounce';

// Interface relasi data
interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    category_id: number;
    category?: Category;
}

interface Unit {
    id: number;
    name: string;
}

export interface Sku {
    id: number;
    product_id: number;
    unit_id: number;
    sku_code: string;
    barcode: string | null;
    base_cost: number;
    current_stock: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    product?: Product;
    unit?: Unit;
}

interface PaginatedSkus {
    data: Sku[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    tenant_slug: string;
    skus: PaginatedSkus;
    filters: {
        search?: string;
        sort_by?: string;
        per_page?: string;
    };
}

export default function Index({
    tenant_slug,
    skus,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [sortBy, setSortBy] = useState(filters.sort_by ?? 'latest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Helper navigasi Inertia
    const updateQueryParams = (newParams: Record<string, any>) => {
        const queryParams = {
            search: search || undefined,
            sort_by: sortBy !== 'latest' ? sortBy : undefined,
            per_page: skus.per_page,
            ...newParams,
        };

        router.get(
            `/${tenant_slug}/inventory/skus`,
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
        [tenant_slug, sortBy, skus.per_page]
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
            sort_by: sortBy !== 'latest' ? sortBy : undefined,
            page: 1,
        });
        setIsFilterOpen(false);
    };

    const handleResetFilter = () => {
        setSortBy('latest');
        updateQueryParams({
            sort_by: undefined,
            page: 1,
        });
        setIsFilterOpen(false);
    };

    const handleDelete = (skuId: number) => {
        if (!confirm('Are you sure you want to delete this SKU?')) {
            return;
        }

        router.delete(`/${tenant_slug}/inventory/skus/${skuId}`);
    };

    const isFilterActive = Boolean(filters.sort_by && filters.sort_by !== 'latest');

    // Helper format mata uang rupiah
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title="SKUs" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">
                            SKUs
                        </h2>

                        <Button asChild className="shadow-md">
                            <Link href={`/${tenant_slug}/inventory/skus/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add SKU
                            </Link>
                        </Button>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Show</span>

                            <select
                                className="rounded-md border border-border bg-card px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                value={skus.per_page}
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
                                    placeholder="Search SKUs, products, barcodes..."
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
                                            <h4 className="font-semibold text-sm">Filter SKUs</h4>
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

                                        {/* Sort By */}
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
                                                <option value="code_asc">SKU Code (A-Z)</option>
                                                <option value="code_desc">SKU Code (Z-A)</option>
                                                <option value="stock_low">Stock (Lowest First)</option>
                                                <option value="stock_high">Stock (Highest First)</option>
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
                                    <th className="p-4 font-semibold">SKU Code</th>
                                    <th className="p-4 font-semibold">Product Name</th>
                                    <th className="p-4 font-semibold">Category</th>
                                    <th className="p-4 font-semibold">Unit</th>
                                    <th className="p-4 font-semibold">Base Cost</th>
                                    <th className="p-4 font-semibold">Stock</th>
                                    <th className="p-4 font-semibold">Date Added</th>
                                    <th className="p-4 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {skus.data.length > 0 ? (
                                    skus.data.map((sku) => (
                                        <tr
                                            key={sku.id}
                                            className="transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 font-medium text-foreground">
                                                <div className="font-semibold">{sku.sku_code}</div>
                                                {sku.barcode && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {sku.barcode}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4 font-medium text-foreground">
                                                {sku.product?.name ?? '-'}
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {sku.product?.category?.name ?? '-'}
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {sku.unit?.name ?? '-'}
                                            </td>

                                            <td className="p-4 text-foreground font-medium">
                                                {formatCurrency(sku.base_cost)}
                                            </td>

                                            <td className="p-4 text-foreground">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                                    sku.current_stock > 10 
                                                        ? 'bg-green-500/10 text-green-600' 
                                                        : 'bg-amber-500/10 text-amber-600'
                                                }`}>
                                                    {sku.current_stock}
                                                </span>
                                            </td>

                                            <td className="p-4 text-muted-foreground">
                                                {new Date(sku.created_at).toLocaleDateString('en-GB')}
                                            </td>

                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            Actions
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/${tenant_slug}/inventory/skus/${sku.id}`}
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/${tenant_slug}/inventory/skus/${sku.id}/edit`}
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                Edit Data
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(sku.id)}
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
                                            colSpan={8}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            No SKUs found.
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
                                {skus.current_page}
                            </span>{' '}
                            of {skus.last_page}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={skus.current_page === 1}
                                onClick={() => handlePagination(skus.current_page - 1)}
                            >
                                Prev
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={skus.current_page === skus.last_page}
                                onClick={() => handlePagination(skus.current_page + 1)}
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
        { title: 'Inventory Management', href: '#' },
        { title: 'SKUs', href: '/inventory/skus' },
    ],
};