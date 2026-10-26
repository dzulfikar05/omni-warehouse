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
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import {
    Plus,
    Package,
    FileText,
    FileSpreadsheet,
    CheckCircle2,
    Layers,
    Clock,
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

export interface ProductItem {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'inactive' | 'draft';
    category_id: number;
    created_at: string;
    category?: Category;
    skus_count?: number;
}

interface ProductStats {
    total_products?: number;
    active_products?: number;
    draft_products?: number;
    total_skus_count?: number;
}

interface IndexProps {
    products: {
        data: ProductItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: ProductStats;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        status?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        per_page?: string;
    };
}

export default function ProductIndex({ products, stats, categories, filters }: IndexProps) {
    const { t } = useTranslation();
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || 'all');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        (filters?.sort_order as 'asc' | 'desc') || 'desc'
    );
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
            newStatus = status,
            newSortBy = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            router.get(
                `/${tenantSlug}/inventory/products`,
                {
                    search: newSearch || undefined,
                    category_id: newCategory !== 'all' ? newCategory : undefined,
                    status: newStatus !== 'all' ? newStatus : undefined,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                    per_page: newPerPage,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [tenantSlug, categoryId, status, sortBy, sortOrder]
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
        setSortOrder(direction);
        applyFilters(search, perPage, categoryId, status, field, direction);
    };

    const handleDelete = (id: number) => {
        router.delete(`/${tenantSlug}/inventory/products/${id}`);
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/inventory/products/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/inventory/products/export/excel`);
    };

    const totalProducts = stats?.total_products ?? products.total ?? 0;
    const activeProducts = stats?.active_products ?? 0;
    const draftProducts = stats?.draft_products ?? 0;
    const totalSkusCount = stats?.total_skus_count ?? 0;

    const canExport = can('tenant.products.export') || can('products.export');
    const canCreate = can('tenant.products.create') || can('products.create');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: t("ID PRODUK"), sortField: 'id' },
        { label: t("NAMA PRODUK"), sortField: 'name' },
        { label: t("KATEGORI"), sortField: 'category_id' },
        { label: t("STATUS"), sortField: 'status' },
        { label: t("TANGGAL DIBUAT"), sortField: 'created_at' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title={t("Master Produk")} />

            <div className="space-y-6 p-4 font-sans sm:p-6">
                <PageHeader
                    title={t("Katalog Produk")}
                    description={t("Kelola kelompok barang induk, kategori persediaan, serta pengelompokan varian SKU.")}
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
                                        <FileText size={15} className="text-red-500" /> {t("Export PDF")}</Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs"
                                    >
                                        <FileSpreadsheet size={15} className="text-emerald-500" /> {t("Export Excel")}</Button>
                                </>
                            )}

                            {canCreate && (
                                <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                    <Link href={`/${tenantSlug}/inventory/products/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> {t("Add Product")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Item Produk")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalProducts}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("Produk Induk")}</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Package size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Produk Aktif")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{activeProducts}</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{t("Siap Dijual")}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Status Draft")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{draftProducts}</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">{t("Perlu Review")}</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Varian SKU")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalSkusCount}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("Terhubung")}</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50">
                            <Layers size={22} />
                        </div>
                    </div>
                </div>

                {/* Table Filter with Dropdown */}
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
                            setStatus('all');
                            setSortBy('created_at');
                            setSortOrder('desc');
                            router.get(`/${tenantSlug}/inventory/products`);
                        }}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{t("Kategori Produk")}</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder={t("Semua Kategori")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("Semua Kategori")}</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{t("Status Produk")}</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder={t("Semua Status")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("Semua Status")}</SelectItem>
                                        <SelectItem value="active">{t("Active")}</SelectItem>
                                        <SelectItem value="inactive">{t("Inactive")}</SelectItem>
                                        <SelectItem value="draft">{t("Draft")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                {/* Data Table Component */}
                <DataTable
                    headers={tableHeaders}
                    data={products.data}
                    pagination={products}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(product: ProductItem) => (
                        <>
                            <TableCell className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                {t("PRD-00")}{product.id}
                            </TableCell>

                            <TableCell className="text-xs font-bold text-foreground">
                                {product.name}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                                <span className="rounded-lg bg-muted px-2 py-0.5 font-medium">
                                    {product.category?.name ?? '-'}
                                </span>
                            </TableCell>

                            <TableCell className="text-xs">
                                <span
                                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                        product.status === 'active'
                                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                            : product.status === 'draft'
                                            ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                            : 'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-400'
                                    }`}
                                >
                                    {product.status ? product.status.toUpperCase() : t("ACTIVE")}
                                </span>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {new Date(product.created_at).toLocaleDateString('id-ID')}
                            </TableCell>

                            <TableCell className="text-right">
                                <ActionButton
                                    label={product.name}
                                    showUrl={`/${tenantSlug}/inventory/products/${product.id}`}
                                    editUrl={`/${tenantSlug}/inventory/products/${product.id}/edit`}
                                    onDelete={() => handleDelete(product.id)}
                                    canShow={can('tenant.products.show') || can('products.show')}
                                    canEdit={can('tenant.products.edit') || can('products.edit')}
                                    canDelete={can('tenant.products.delete') || can('products.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

ProductIndex.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Products", href: '#' },
    ],
};
