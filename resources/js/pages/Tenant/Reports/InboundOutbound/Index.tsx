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
import { ArrowDown, ArrowUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Index({ reports, summary, warehouses, categories, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [tempWarehouse, setTempWarehouse] = useState(filters.warehouse_id || 'all');
    const [tempCategory, setTempCategory] = useState(filters.category_id || 'all');
    const [tempStatus, setTempStatus] = useState(filters.status || 'all');
    const [tempDateFrom, setTempDateFrom] = useState(filters.date_from || '');
    const [tempDateTo, setTempDateTo] = useState(filters.date_to || '');

    const applyFilters = useCallback(
        (newSearch: string, newPerPage: string, warehouse: string, category: string, status: string, dateFrom: string, dateTo: string) => {
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
        () => debounce((q: string, p: string, w: string, c: string, s: string, df: string, dt: string) => applyFilters(q, p, w, c, s, df, dt), 500),
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

    return (
        <>
            <Head title="Inbound / Outbound Summary" />
            <div className="space-y-6 p-4">
                <PageHeader
                    title="Inbound / Outbound Report"
                    description="Welcome back! Here is your inbound and outbound movement summary."
                >
                    <TableFilter
                        search={search}
                        onSearchChange={onSearchChange}
                        perPage={perPage}
                        onPerPageChange={onPerPageChange}
                    >
                        <FilterDropdown
                            onApply={() => applyFilters(search, perPage, tempWarehouse, tempCategory, tempStatus, tempDateFrom, tempDateTo)}
                            onReset={() => {
                                setTempWarehouse('all');
                                setTempCategory('all');
                                setTempStatus('all');
                                setTempDateFrom('');
                                setTempDateTo('');
                                applyFilters(search, perPage, 'all', 'all', 'all', '', '');
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

                                <div className="space-y-2">
                                    <Label className="text-xs">Transaction Status</Label>
                                    <Select value={tempStatus} onValueChange={setTempStatus}>
                                        <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="canceled">Canceled</SelectItem>
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
                            <CardTitle className="text-xs text-muted-foreground">Total Received Units:</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-900">{summary.total_received_units.toLocaleString()} units</div></CardContent>
                    </Card>
                    <Card className="border-blue-100 bg-blue-50/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs text-muted-foreground">Total Dispatch Units:</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold text-blue-900">{summary.total_dispatch_units.toLocaleString()} units</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Open Inbound POs:</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{summary.open_inbound_pos}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Open Outbound POs:</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{summary.open_outbound_pos}</div></CardContent>
                    </Card>
                </div>

                <DataTable
                    headers={['Date', 'Transaction ID', 'Flow Type', 'Contact', 'SKU Code', 'Product Name', 'QTY', 'Status']}
                    data={reports.data}
                    pagination={reports}
                    renderRow={(item: any) => {
                        const isInbound = item.transaction?.transaction_type === 'IN';
                        return (
                            <>
                                <TableCell className="text-xs">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="font-mono text-xs">{item.transaction?.local_uuid || 'TR-IN-01'}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center gap-1 font-semibold text-xs ${isInbound ? 'text-blue-600' : 'text-indigo-600'}`}>
                                        {isInbound ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                                        {isInbound ? 'Inbound' : 'Outbound'}
                                    </span>
                                </TableCell>
                                <TableCell>{item.transaction?.supplier?.name || item.transaction?.customer?.name || '-'}</TableCell>
                                <TableCell className="font-mono text-xs">{item.sku?.sku_code}</TableCell>
                                <TableCell className="font-medium text-foreground">{item.sku?.product?.name}</TableCell>
                                <TableCell className="font-bold">{item.quantity}</TableCell>
                                <TableCell>
                                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                                        {item.transaction?.status || 'Completed'}
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
