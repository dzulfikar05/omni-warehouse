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
    FolderTree,
    FileText,
    FileSpreadsheet,
    Package,
    AlignLeft,
} from 'lucide-react';

export interface CategoryItem {
    id: number;
    name: string;
    desc?: string;
    created_at: string;
    products_count?: number;
}

interface CategoryStats {
    total_categories?: number;
    total_products_count?: number;
    categories_with_desc?: number;
}

interface IndexProps {
    categories: {
        data: CategoryItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats?: CategoryStats;
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        per_page?: string;
    };
}

export default function CategoryIndex({ categories, stats, filters }: IndexProps) {
    const { t } = useTranslation();
    const { flash, current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const [search, setSearch] = useState(filters?.search || '');
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
            newSortBy: string = sortBy,
            newSortOrder: 'asc' | 'desc' = sortOrder
        ) => {
            router.get(
                `/${tenantSlug}/inventory/categories`,
                {
                    search: newSearch || undefined,
                    sort_by: newSortBy,
                    sort_order: newSortOrder,
                    per_page: newPerPage,
                },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        },
        [tenantSlug, sortBy, sortOrder]
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
        applyFilters(search, perPage, field, direction);
    };

    const handleDelete = (id: number) => {
        router.delete(`/${tenantSlug}/inventory/categories/${id}`);
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/inventory/categories/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/inventory/categories/export/excel`);
    };

    const totalCategories = stats?.total_categories ?? categories.total ?? 0;
    const totalProductsCount = stats?.total_products_count ?? 0;
    const categoriesWithDesc = stats?.categories_with_desc ?? 0;

    const canExport = can('tenant.categories.export') || can('categories.export');
    const canCreate = can('tenant.categories.create') || can('categories.create');

    const tableHeaders: Array<string | HeaderConfig> = [
        { label: t("CATEGORY ID"), sortField: 'id' },
        { label: t("CATEGORY NAME"), sortField: 'name' },
        { label: t("DESCRIPTION"), sortField: 'desc' },
        { label: t("PRODUCTS COUNT"), sortField: 'products_count' },
        { label: t("DATE ADDED"), sortField: 'created_at' },
        'ACTIONS',
    ];

    return (
        <>
            <Head title={t("Product Categories")} />

            <div className="space-y-6 p-4 font-sans sm:p-6">
                <PageHeader
                    title={t("Product Categories")}
                    description={t("Organize and structure your inventory products into logical classifications.")}
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
                                    <Link href={`/${tenantSlug}/inventory/categories/create`}>
                                        <Plus className="mr-1.5 h-4 w-4" /> {t("Add Category")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Categories")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalCategories}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("Classifications")}</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <FolderTree size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Linked Products")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalProductsCount}</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{t("Assigned Items")}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <Package size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Detailed Categories")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{categoriesWithDesc}</h3>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("With Descriptions")}</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50">
                            <AlignLeft size={22} />
                        </div>
                    </div>
                </div>

                {/* Table Filter Component */}
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
                />

                {/* Data Table Component */}
                <DataTable
                    headers={tableHeaders}
                    data={categories.data}
                    pagination={categories}
                    sortBy={sortBy}
                    sortDirection={sortOrder}
                    onSortChange={handleSortChange}
                    renderRow={(category: CategoryItem) => (
                        <>
                            <TableCell className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                {t("CAT-00")}{category.id}
                            </TableCell>

                            <TableCell className="text-xs font-bold text-foreground">
                                {category.name}
                            </TableCell>

                            <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                                {category.desc || '-'}
                            </TableCell>

                            <TableCell className="font-mono text-xs">
                                <span className="rounded-lg bg-muted px-2.5 py-0.5 font-bold">
                                    {category.products_count ?? 0}
                                </span>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {new Date(category.created_at).toLocaleDateString('en-GB')}
                            </TableCell>

                            <TableCell className="text-right">
                                <ActionButton
                                    label={category.name}
                                    showUrl={`/${tenantSlug}/inventory/categories/${category.id}`}
                                    editUrl={`/${tenantSlug}/inventory/categories/${category.id}/edit`}
                                    onDelete={() => handleDelete(category.id)}
                                    canShow={can('tenant.categories.show') || can('categories.show')}
                                    canEdit={can('tenant.categories.edit') || can('categories.edit')}
                                    canDelete={can('tenant.categories.delete') || can('categories.delete')}
                                />
                            </TableCell>
                        </>
                    )}
                />
            </div>
        </>
    );
}

CategoryIndex.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Categories", href: '#' },
    ],
};
