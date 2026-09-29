import { Head, router } from '@inertiajs/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { DollarSign } from 'lucide-react';

export default function Index({ reports, summary, warehouses, categories, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [tempWarehouse, setTempWarehouse] = useState(filters.warehouse_id || 'all');
    const [tempCategory, setTempCategory] = useState(filters.category_id || 'all');
    const [tempDateFrom, setTempDateFrom] = useState(filters.date_from || '');
    const [tempDateTo, setTempDateTo] = useState(filters.date_to || '');

    const formatRp = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    const applyFilters = useCallback(
        (newSearch: string, newPerPage: string, warehouse: string, category: string, dateFrom: string, dateTo: string) => {
            router.get(
                window.location.pathname,
                {
                    search: newSearch,
                    per_page: newPerPage,
                    warehouse_id: warehouse !== 'all' ? warehouse : undefined,
                    category_id: category !== 'all' ? category : undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        []
    );

    const debouncedSearch = useMemo(
        () => debounce((q: string, p: string, w: string, c: string, df: string, dt: string) => applyFilters(q, p, w, c, df, dt), 500),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, perPage, tempWarehouse, tempCategory, tempDateFrom, tempDateTo);
    };

    const onPerPageChange = (value: string) => {
        setPerPage(value);
        applyFilters(search, value, tempWarehouse, tempCategory, tempDateFrom, tempDateTo);
    };

    return (
        <>
            <Head title="Valuation & Asset Report" />
            <div className="space-y-6 p-4">
                <PageHeader
                    title="Valuation & Asset Report"
                    description="Welcome back! Asset valuation and stock ledger."
                >
                    <TableFilter
                        search={search}
                        onSearchChange={onSearchChange}
                        perPage={perPage}
                        onPerPageChange={onPerPageChange}
                    >
                        <FilterDropdown
                            onApply={() => applyFilters(search, perPage, tempWarehouse, tempCategory, tempDateFrom, tempDateTo)}
                            onReset={() => {
                                setTempWarehouse('all');
                                setTempCategory('all');
                                setTempDateFrom('');
                                setTempDateTo('');
                                applyFilters(search, perPage, 'all', 'all', '', '');
                            }}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Warehouse</Label>
                                    <Select value={tempWarehouse} onValueChange={setTempWarehouse}>
                                        <SelectTrigger><SelectValue placeholder="All Warehouse" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Warehouse</SelectItem>
                                            {warehouses?.map((w: any) => (
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
                                            {categories?.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
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

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-blue-100 bg-blue-50/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs text-muted-foreground">Total Asset Value:</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-600">{formatRp(summary.total_asset_value)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Stock Adjustment:</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{summary.stock_adjustment}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Damaged / Stopped Units:</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{summary.damaged_units}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Reserved / Allocated Stock:</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{summary.reserved_stock}</div></CardContent>
                    </Card>
                </div>

                <DataTable
                    headers={['SKU Code', 'Product Name', 'Location', 'Category', 'Qty On Hand', 'Avg Cost / Unit Cost', 'Total Asset Value']}
                    data={reports.data}
                    pagination={reports}
                    renderRow={(item: any) => {
                        const cost = item.sku?.base_cost || 0;
                        const qty = item.quantity || 0;
                        const totalValue = qty * cost;

                        return (
                            <>
                                <TableCell className="font-mono text-xs">{item.sku?.sku_code}</TableCell>
                                <TableCell className="font-medium text-foreground">{item.sku?.product?.name}</TableCell>
                                <TableCell>{item.location?.warehouse?.name || '-'}</TableCell>
                                <TableCell>{item.sku?.product?.category?.name || '-'}</TableCell>
                                <TableCell className="font-bold">{qty}</TableCell>
                                <TableCell>{formatRp(cost)}</TableCell>
                                <TableCell className="font-bold text-blue-600">{formatRp(totalValue)}</TableCell>
                            </>
                        );
                    }}
                />
            </div>
        </>
    );
}
