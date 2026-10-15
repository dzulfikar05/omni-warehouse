import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Boxes,
    Plus,
    FileText,
    FileSpreadsheet,
    Edit3,
    Trash2,
    Eye,
    TrendingDown,
    CheckCircle2,
    DollarSign,
    MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { TableFilter } from '@/components/table-filter';
import { FilterDropdown } from '@/components/table-dropdown';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category { id: number; name: string; }
interface Unit { id: number; name: string; symbol: string; }
interface Product { id: number; name: string; category?: Category; }

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

interface PaginatedSkus {
    data: SkuItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface IndexProps {
    tenant_slug: string;
    skus: PaginatedSkus;
    categories: Category[];
    units: Unit[];
    filters: {
        search?: string;
        category_id?: string;
        unit_id?: string;
        sort_by?: string;
        per_page?: string;
    };
}

export default function Index({ tenant_slug, skus, categories, units, filters }: IndexProps) {
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.permissions || auth?.user?.permissions || [];

    const hasPermission = (permissionName: string) => {
        if (auth?.user?.roles?.some((r: any) => r.name === 'superadmin' || r.name === 'admin')) {
            return true;
        }
        return permissions.includes(permissionName);
    };

    const [search, setSearch] = useState(filters.search ?? '');
    const [categoryId, setCategoryId] = useState(filters.category_id ?? 'all');
    const [unitId, setUnitId] = useState(filters.unit_id ?? 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by ?? 'latest');
    const [perPage, setPerPage] = useState(filters.per_page ?? '10');

    // Ringkasan Statistik Data
    const totalSkus = skus.total;
    const totalStock = skus.data.reduce((acc, curr) => acc + curr.current_stock, 0);
    const lowStockCount = skus.data.filter((item) => item.current_stock <= (item.min_stock ?? 5)).length;
    const totalValuation = skus.data.reduce((acc, curr) => acc + (curr.base_cost * curr.current_stock), 0);

    const updateQueryParams = (newParams: Record<string, any>) => {
        router.get(
            `/${tenant_slug}/inventory/skus`,
            {
                search: search || undefined,
                category_id: categoryId !== 'all' ? categoryId : undefined,
                unit_id: unitId !== 'all' ? unitId : undefined,
                sort_by: sortBy !== 'latest' ? sortBy : undefined,
                per_page: perPage,
                ...newParams,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (skuId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data SKU ini?')) {
            router.delete(`/${tenant_slug}/inventory/skus/${skuId}`, {
                onSuccess: () => toast.success('Data SKU berhasil dihapus.'),
            });
        }
    };

    const handleExportPdf = () => {
        router.post(`/${tenant_slug}/inventory/skus/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenant_slug}/inventory/skus/export/excel`);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <>
            <Head title="Master Data SKU" />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                <PageHeader
                    title="Master Data Stock Keeping Unit (SKU)"
                    description="Kelola varian barang, kode barcode, harga modal acuan, serta pantau ambang batas stok minimum."
                    renderAction={
                        <div className="flex items-center gap-2">
                            {hasPermission('tenant.skus.export') && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPdf}
                                        className="h-9 gap-1.5 border-border text-xs rounded-xl"
                                    >
                                        <FileText size={15} className="text-red-500" /> Export PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportExcel}
                                        className="h-9 gap-1.5 border-border text-xs rounded-xl"
                                    >
                                        <FileSpreadsheet size={15} className="text-emerald-500" /> Export Excel
                                    </Button>
                                </>
                            )}
                            {hasPermission('tenant.skus.create') && (
                                <Button
                                    asChild
                                    className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs rounded-xl gap-1.5"
                                >
                                    <Link href={`/${tenant_slug}/inventory/skus/create`}>
                                        <Plus size={16} /> Tambah SKU Baru
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* 4 STAT CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Total Item SKU</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">{totalSkus} <span className="text-xs font-normal text-muted-foreground">Varian</span></div>
                            <div className="text-xs text-muted-foreground mt-1">Terdaftar di katalog sistem</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Aset Fisik Stok</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">{totalStock} <span className="text-xs font-normal text-muted-foreground">Unit</span></div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Status persediaan aktif</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Stok Menipis</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">{lowStockCount} <span className="text-xs font-normal text-amber-600">SKU</span></div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">Perlu Restock Segera</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Estimasi Nilai Persediaan</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(totalValuation)}</div>
                            <div className="text-xs text-muted-foreground mt-1">Berdasarkan HPP / Base Cost</div>
                        </div>
                    </div>
                </div>

                {/* FILTER BAR - FIXED TYPESCRIPT EVENT BUG */}
                <TableFilter
                    search={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    perPage={perPage}
                    onPerPageChange={(val: string) => {
                        setPerPage(val);
                        updateQueryParams({ per_page: val, page: 1 });
                    }}
                >
                    <FilterDropdown
                        onApply={() => updateQueryParams({ page: 1 })}
                        onReset={() => {
                            setSearch('');
                            setCategoryId('all');
                            setUnitId('all');
                            setSortBy('latest');
                            router.get(`/${tenant_slug}/inventory/skus`);
                        }}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Kategori Produk</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Satuan (Unit)</Label>
                                <Select value={unitId} onValueChange={setUnitId}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Semua Unit" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Satuan</SelectItem>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.symbol})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Urutkan Berdasarkan</Label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Urutan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Terbaru Ditambahkan</SelectItem>
                                        <SelectItem value="oldest">Terlama</SelectItem>
                                        <SelectItem value="code_asc">Kode SKU (A-Z)</SelectItem>
                                        <SelectItem value="code_desc">Kode SKU (Z-A)</SelectItem>
                                        <SelectItem value="stock_low">Stok Terendah</SelectItem>
                                        <SelectItem value="stock_high">Stok Tertinggi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                {/* TABLE CARD */}
                <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden text-card-foreground">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-5">Kode SKU / Barcode</th>
                                    <th className="py-3 px-5">Nama Produk</th>
                                    <th className="py-3 px-5">Kategori</th>
                                    <th className="py-3 px-5">Satuan</th>
                                    <th className="py-3 px-5 text-right">Base Cost (Rp)</th>
                                    <th className="py-3 px-5 text-center">Stok Aktual</th>
                                    <th className="py-3 px-5 text-center">Tanggal Dibuat</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {skus.data.length > 0 ? (
                                    skus.data.map((sku) => (
                                        <tr key={sku.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-5 font-mono">
                                                <div className="font-bold text-blue-600 dark:text-blue-400">{sku.sku_code}</div>
                                                <div className="text-[11px] text-muted-foreground">{sku.barcode || '-'}</div>
                                            </td>
                                            <td className="py-3 px-5 font-semibold text-foreground">
                                                {sku.product?.name ?? '-'}
                                            </td>
                                            <td className="py-3 px-5 text-muted-foreground">
                                                <span className="px-2 py-0.5 bg-muted rounded-lg font-medium">
                                                    {sku.product?.category?.name ?? '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-muted-foreground font-mono">
                                                {sku.unit?.name ?? sku.unit?.symbol ?? '-'}
                                            </td>
                                            <td className="py-3 px-5 text-right font-mono font-semibold">
                                                {formatCurrency(sku.base_cost)}
                                            </td>
                                            <td className="py-3 px-5 text-center font-mono">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                                    sku.current_stock <= (sku.min_stock ?? 5)
                                                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                }`}>
                                                    {sku.current_stock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-center text-muted-foreground font-mono">
                                                {new Date(sku.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl">
                                                        {hasPermission('tenant.skus.show') && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/${tenant_slug}/inventory/skus/${sku.id}`} className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Detail SKU
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('tenant.skus.edit') && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/${tenant_slug}/inventory/skus/${sku.id}/edit`} className="cursor-pointer">
                                                                    <Edit3 className="mr-2 h-4 w-4 text-blue-600" /> Edit Data
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('tenant.skus.delete') && (
                                                            <DropdownMenuItem onClick={() => handleDelete(sku.id)} className="cursor-pointer text-red-600">
                                                                <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Hapus
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Boxes className="w-8 h-8 text-muted-foreground/60 stroke-1" />
                                                <p className="text-xs font-semibold text-foreground">Tidak ada data SKU terdaftar.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            Halaman <strong className="text-foreground">{skus.current_page}</strong> dari <strong className="text-foreground">{skus.last_page}</strong> (Total {skus.total} SKU)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={skus.current_page === 1}
                                onClick={() => updateQueryParams({ page: skus.current_page - 1 })}
                                className="h-8 text-xs rounded-xl border-border"
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={skus.current_page === skus.last_page}
                                onClick={() => updateQueryParams({ page: skus.current_page + 1 })}
                                className="h-8 text-xs rounded-xl border-border"
                            >
                                Selanjutnya
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
        { title: 'Master SKU', href: '#' },
    ],
};
