import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, Search, SlidersHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Product {
    product_id: string;
    product_name: string;
    category: string;
    created_by: string;
    date_added: string;
}

export default function Index({ products }: { products: Product[] }) {
    const [search, setSearch] = useState('');

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">
                            Products
                        </h2>
                        <Button asChild className="shadow-md">
                            <Link href="/products/create">
                                <Plus className="mr-2 h-4 w-4" /> Add Product
                            </Link>
                        </Button>
                    </div>

                    {/* Controls Bar (Show entries & Search/Filter) */}
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Show</span>
                            <select className="rounded-md border border-border bg-card px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <span>entries</span>
                        </div>

                        <div className="flex items-center space-x-3 w-full md:w-auto">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="outline" className="flex items-center space-x-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Filter</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-lg bg-card text-card-foreground shadow-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                    <th className="p-4 font-semibold">Product ID</th>
                                    <th className="p-4 font-semibold">Product Name</th>
                                    <th className="p-4 font-semibold">Category</th>
                                    <th className="p-4 font-semibold">Created By</th>
                                    <th className="p-4 font-semibold">Date Added</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {products && products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.product_id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-4 font-medium text-foreground">{product.product_id}</td>
                                            <td className="p-4 text-foreground">{product.product_name}</td>
                                            <td className="p-4 text-muted-foreground">{product.category}</td>
                                            <td className="p-4 text-muted-foreground">{product.created_by}</td>
                                            <td className="p-4 text-muted-foreground">{product.date_added}</td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            Actions
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/products/${product.product_id}`} className="flex items-center cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                <span>View Details</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/products/${product.product_id}/edit`} className="flex items-center cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                <span>Edit Data</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link 
                                                                href={`/products/${product.product_id}`} 
                                                                method="delete" 
                                                                as="button" 
                                                                className="flex items-center w-full cursor-pointer text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                                <span>Delete Data</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20 text-sm text-muted-foreground">
                        <div>
                            Page <span className="font-medium text-foreground">1</span> of 10
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled>
                                Prev
                            </Button>
                            <Button variant="outline" size="sm">
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
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/products' },
    ],
};