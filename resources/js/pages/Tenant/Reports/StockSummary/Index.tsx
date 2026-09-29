import { Head, router } from '@inertiajs/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, PackageX, Boxes } from 'lucide-react';

interface Warehouse {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface StockSummaryProps {
    reports: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    summary: {
        total_products: number;
        total_quantity: number;
        total_inventory_value: number;
        low_stock_items: number;
        out_of_stock: number;
    };
    warehouses: Warehouse[];
    categories: Category[];
    filters: {
        search?: string;
        per_page?: string;
        warehouse_id?: string;
        category_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ reports, summary, warehouses, categories, filters }: StockSummaryProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [tempWarehouse, setTempWarehouse] = useState(filters.warehouse_id || 'all');
    const [tempCategory, setTempCategory] = useState(filters.category_id || 'all');
    const [tempStatus, setTempStatus] = useState(filters.status || 'all');
    const [tempDateFrom, setTempDateFrom] = useState(filters.date_from || '');
    const [tempDateTo, setTempDateTo] = useState(filters.date_to || '');

    const formatRp = (val: number) => {
        if (val >= 1_000_000_000) {
            return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
        }
        if (val >= 1_000_000) {
            return `Rp ${(val / 1_000_000).toFixed(2)} Jt`;
        }
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
    };

    const applyFilters = useCallback(
        (
            newSearch: string,
            newPerPage: string,
            warehouse: string,
            category: string,
            status: string,
            dateFrom: string,
            dateTo: string
        ) => {
            router.get(
                window.location.pathname,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    warehouse_id: warehouse !== 'all' ? warehouse : undefined,
                    category_id: category !== 'all' ? category : undefined,
                    status: status !== 'all' ? status : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        []
    );

    const debouncedSearch = useMemo(
        () =>
            debounce(
                (q: string, p: string, w: string, c: string, s: string, df: string, dt: string) =>
                    applyFilters(q, p, w, c, s, df, dt),
                500
            ),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo);
    };

    const handleApplyFilter = () => {
        applyFilters(search, perPage, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo);
    };

    const handleResetFilter = () => {
        setTempWarehouse('all');
        setTempCategory('all');
        setTempStatus('all');
        setTempDateFrom('');
        setTempDateTo('');
        applyFilters(search, perPage, 'all', 'all', 'all', '', '');
    };

    return (
        <>
            <Head title="Stock Summary Report" />
            <div className="space-y-6 p-4">
                <PageHeader
                    title="Stock Summary Report"
                    description="Welcome back! Here is your stock summary report."
                >
                    <TableFilter
                        search={search}
                        onSearchChange={onSearchChange}
                        perPage={perPage}
                        onPerPageChange={onPerPageChange}
                    >
                        <FilterDropdown onApply={handleApplyFilter} onReset={handleResetFilter}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Warehouse</Label>
                                    <Select value={tempWarehouse} onValueChange={setTempWarehouse}>
                                        <SelectTrigger><SelectValue placeholder="All Warehouse" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Warehouse</SelectItem>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Category</Label>
                                    <Select value={tempCategory} onValueChange={setTempCategory}>
                                        <SelectTrigger><SelectValue placeholder="All Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Category</SelectItem>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Stock Status</Label>
                                    <Select value={tempStatus} onValueChange={setTempStatus}>
                                        <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="in_stock">In Stock</SelectItem>
                                            <SelectItem value="low_stock">Low Stock</SelectItem>
                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Date From</Label>
                                        <Input
                                            type="date"
                                            value={tempDateFrom}
                                            onChange={(e) => setTempDateFrom(e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Date To</Label>
                                        <Input
                                            type="date"
                                            value={tempDateTo}
                                            onChange={(e) => setTempDateTo(e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FilterDropdown>
                    </TableFilter>
                </PageHeader>

                {/* Cards Summary dengan Aksen Biru */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card className="border-blue-100 bg-blue-50/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Products:</CardTitle>
                            <Boxes className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-900">{summary.total_products.toLocaleString()}</div></CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Quantity:</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-900">{summary.total_quantity.toLocaleString()}</div></CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total Inventory Value:</CardTitle>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-600">{formatRp(summary.total_inventory_value)}</div></CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Low Stock Items:</CardTitle>
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-amber-600">{summary.low_stock_items}</div></CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Out Of Stock:</CardTitle>
                            <PackageX className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-rose-600">{summary.out_of_stock}</div></CardContent>
                    </Card>
                </div>

                <DataTable
                    headers={['SKU Code', 'Product Name', 'Warehouse', 'Current Stock', 'Unit', 'Category', 'Status']}
                    data={reports.data}
                    pagination={reports}
                    renderRow={(item: any) => {
                        const qty = item.quantity;
                        let statusText = 'In Stock';
                        let badgeStyle = 'bg-blue-600 hover:bg-blue-700 text-white';

                        if (qty <= 0) {
                            statusText = 'Out of Stock';
                            badgeStyle = 'bg-rose-600 hover:bg-rose-700 text-white';
                        } else if (qty <= 15) {
                            statusText = 'Low Stock';
                            badgeStyle = 'bg-amber-500 hover:bg-amber-600 text-white';
                        }

                        return (
                            <>
                                <TableCell className="font-mono text-xs">{item.sku?.sku_code}</TableCell>
                                <TableCell className="font-medium text-foreground">{item.sku?.product?.name}</TableCell>
                                <TableCell>{item.location?.warehouse?.name || '-'}</TableCell>
                                <TableCell className="font-bold">{qty}</TableCell>
                                <TableCell>{item.sku?.unit?.symbol || '-'}</TableCell>
                                <TableCell>{item.sku?.product?.category?.name || '-'}</TableCell>
                                <TableCell>
                                    <Badge className={badgeStyle}>
                                        {statusText}
                                    </Badge>
                                </TableCell>
                            </>
                        );
                    }}
                />
            </div>
        </>
    );
}
