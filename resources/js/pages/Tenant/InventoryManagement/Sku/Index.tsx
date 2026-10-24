import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { DataTable, HeaderConfig } from '@/components/data-table';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import { ActionButton } from '@/components/action-button';
import { PageHeader } from '@/components/page-header';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { usePermission } from '@/utils/permission';
import {
    Plus,
    Boxes,
    FileText,
    FileSpreadsheet,
    CheckCircle2,
    TrendingDown,
    DollarSign,
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    symbol: string;
}

interface Product {
    id: number;
    name: string;
    category?: Category;
}

export interface SkuItem {
    id: number;
    product_id: number;
    unit_id: number;
    sku_code: string;
    barcode: string | null;
    base_cost: number;
    current_stock: number;
    min_stock?: number;
    created_at: string;
    product?: Product;
    unit?: Unit;
}

interface SkuStats {
    total_skus?: number;
    total_stock?: number;
    low_stock_count?: number;
    total_valuation?: number;
}

interface IndexProps {
    skus: {
        data: SkuItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: SkuStats;
    categories: Category[];
    units: Unit[];
    filters: {
        search?: string;
        category_id?: string;
        unit_id?: string;
        sort_by?: string;
        sort_dir?: 'asc' | 'desc';
        per_page?: string;
    };
}

export default function SkuIndex({ skus, stats, categories, units, filters }: IndexProps) {
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || 'all');
    const [unitId, setUnitId] = useState(filters?.unit_id || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(filters?.sort_dir || 'desc');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    const applyFilters = useCallback(
        (
            newSearch: string,
            newPerPage: string,
            newCategory = categoryId,
            newUnit = unitId,
            newSortBy = sortBy,
            newSortDir = sortDir
        ) => {
            router.get(
                `/${tenantSlug}/inventory/skus`,
                {
                    search: newSearch || undefined,
                    category_id: newCategory !== 'all' ? newCategory : undefined,
                    unit_id: newUnit !== 'all' ? newUnit : undefined,
                    sort_by: newSortBy,
                    sort_dir: newSortDir,
                    per_page: newPerPage,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [tenantSlug, categoryId, unitId, sortBy, sortDir]
    );

    const debouncedSearch = useMemo(
        () => debounce((q: string, p: string) => applyFilters(q, p), 500),
        [applyFilters]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
        setSortBy(field);
        setSortDir(direction);
        applyFilters(search, perPage, categoryId, unitId, field, direction);
    };

    const handleDelete = (id: number) => {
        router.delete(`/${tenantSlug}/inventory/skus/${id}`);
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/inventory/skus/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/inventory/skus/export/excel`);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const totalSkus = stats?.total_skus ?? skus.total ?? 0;
    const totalStock = stats?.total_stock ?? skus.data.reduce((acc, curr) => acc + Number(curr.current_stock || 0), 0);
    const lowStockCount = stats?.low_stock_count ?? skus.data.filter((item) => item.current_stock <= (item.min_stock ?? 5)).length;
    const totalValuation = stats?.total_valuation ?? skus.data.reduce((acc, curr) => acc + (Number(curr.base_cost || 0) * Number(curr.current_stock || 0)), 0);

    const canExport = can('tenant.skus.export') || can('skus.export');
    const canCreate = can('tenant.skus.create') || can('skus.create');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: 'KODE SKU / BARCODE', sortField: 'sku_code' },
        { label: 'NAMA PRODUK', sortField: 'product_id' },
        'KATEGORI',
        'SATUAN',
        { label: 'BASE COST (HPP)', sortField: 'base_cost' },
        { label: 'STOK AKTUAL', sortField: 'current_stock' },
        { label: 'TANGGAL DIBUAT', sortField: 'created_at' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title="Master SKU" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Stock Keeping Unit (SKU)"
                    description="Kelola varian barang, kode barcode, harga modal acuan, serta pantau ambang batas stok minimum."
                    renderAction={
                        <div className="flex items-center gap-2">
                            {canExport && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPdf}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileText size={15} className="text-red-500" /> Export PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileSpreadsheet size={15} className="text-emerald-500" /> Export Excel
                                    </Button>
                                </>
                            )}

                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href={`/${tenantSlug}/inventory/skus/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> Add SKU
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Item SKU</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalSkus}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">Varian Terdaftar</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Boxes size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Aset Fisik Stok</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalStock}</h3>
                            <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Unit Persediaan</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Stok Menipis</p>
                            <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</h3>
                            <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">Perlu Restock</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50">
                            <TrendingDown size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Estimasi Nilai Persediaan</p>
                            <h3 className="mt-1 text-xl font-bold text-foreground">{formatCurrency(totalValuation)}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">Berdasarkan HPP</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50">
                            <DollarSign size={22} />
                        </div>
                    </div>
                </div>

                {/* Table Filter dengan Dropdown */}
                <TableFilter
                    search={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        debouncedSearch(e.target.value, perPage);
                    }}
                    perPage={perPage}
                    onPerPageChange={(val) => {
                        setPerPage(val);
                        applyFilters(search, val);
                    }}
                >
                    <FilterDropdown
                        onApply={() => applyFilters(search, perPage)}
                        onReset={() => {
                            setSearch('');
                            setCategoryId('all');
                            setUnitId('all');
                            setSortBy('created_at');
                            setSortDir('desc');
                            router.get(`/${tenantSlug}/inventory/skus`);
                        }}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Kategori Produk</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Satuan (Unit)</Label>
                                <Select value={unitId} onValueChange={setUnitId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Semua Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Satuan</SelectItem>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name} ({u.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                {/* Reusable Data Table Component */}
                <DataTable
                    headers={tableHeaders}
                    data={skus.data}
                    pagination={skus}
                    sortBy={sortBy}
                    sortDirection={sortDir}
                    onSortChange={handleSortChange}
                    renderRow={(sku: SkuItem) => (
                        <>
                            <TableCell className="font-mono text-xs">
                                <div className="font-bold text-blue-600 dark:text-blue-400">{sku.sku_code}</div>
                                <div className="text-[11px] text-muted-foreground">{sku.barcode || '-'}</div>
                            </TableCell>

                            <TableCell className="text-xs font-bold text-foreground">
                                {sku.product?.name ?? '-'}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                                <span className="rounded-lg bg-muted px-2 py-0.5 font-medium">
                                    {sku.product?.category?.name ?? '-'}
                                </span>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {sku.unit?.name ?? sku.unit?.symbol ?? '-'}
                            </TableCell>

                            <TableCell className="font-mono text-xs font-semibold text-foreground">
                                {formatCurrency(sku.base_cost)}
                            </TableCell>

                            <TableCell className="font-mono text-xs">
                                <span
                                    className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                                        sku.current_stock <= (sku.min_stock ?? 5)
                                            ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    }`}
                                >
                                    {sku.current_stock}
                                </span>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {new Date(sku.created_at).toLocaleDateString('id-ID')}
                            </TableCell>

                            <TableCell className="text-right">
                                <ActionButton
                                    label={sku.sku_code}
                                    showUrl={`/${tenantSlug}/inventory/skus/${sku.id}`}
                                    editUrl={`/${tenantSlug}/inventory/skus/${sku.id}/edit`}
                                    onDelete={() => handleDelete(sku.id)}
                                    canShow={can('tenant.skus.show') || can('skus.show')}
                                    canEdit={can('tenant.skus.edit') || can('skus.edit')}
                                    canDelete={can('tenant.skus.delete') || can('skus.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

SkuIndex.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '#' },
        { title: 'Master SKU', href: '#' },
    ],
};
