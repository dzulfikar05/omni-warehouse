import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Boxes,
    Building2,
    CheckCircle2,
    AlertTriangle,
    Layers,
    Scale,
    Warehouse as WarehouseIcon,
    Printer,
    Plus,
    ScanBarcode,
    Check,
    Edit3,
    CheckCheck,
    FileText,
    FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useTranslation } from '@/context/language-context';
import { ReconciliationItem, StockOpnamePageProps } from '@/types/stock-opname';
import { CreateOpnameModal } from './components/CreateOpnameModal';
import { VerificationModal } from './components/VerificationModal';
import { PrintSheetModal } from './components/PrintSheetModal';

export default function Index({ session: initialSession, items: initialItems }: StockOpnamePageProps) {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;

    const [items, setItems] = useState<ReconciliationItem[]>(initialItems || []);
    const [barcodeInput, setBarcodeInput] = useState<string>('');

    // Filter States
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState('10');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [verifModalItem, setVerifModalItem] = useState<ReconciliationItem | null>(null);

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const activeTenantName =
        current_tenant?.name ||
        auth?.user?.tenant_name ||
        auth?.user?.tenant?.name ||
        initialSession?.warehouse_name ||
        'Gudang Utama';

    // Derived Statistics
    const totalSkus = items.length;
    const totalSystemQty = items.reduce((acc, curr) => acc + curr.system_qty, 0);
    const matchedSkus = items.filter((item) => item.variance === 0).length;
    const deficitUnits = items.reduce((acc, curr) => (curr.variance < 0 ? acc + curr.variance : acc), 0);
    const surplusUnits = items.reduce((acc, curr) => (curr.variance > 0 ? acc + curr.variance : acc), 0);
    const netVariance = deficitUnits + surplusUnits;
    const matchPercentage = totalSkus > 0 ? ((matchedSkus / totalSkus) * 100).toFixed(1) : '0';

    // Filtered Items for Data Table
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                item.sku.toLowerCase().includes(search.toLowerCase()) ||
                item.barcode.toLowerCase().includes(search.toLowerCase()) ||
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.rack.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [items, search, statusFilter]);

    // Barcode Quick Input Handler
    const handleScannerSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const query = barcodeInput.trim().toLowerCase();
        if (!query) return;

        const found = items.find(
            (item) =>
                item.barcode.toLowerCase() === query ||
                item.sku.toLowerCase() === query ||
                item.rack.toLowerCase() === query,
        );

        if (found) {
            setVerifModalItem(found);
            setBarcodeInput('');
        } else {
            toast.error(`SKU/Barcode "${barcodeInput}" tidak ditemukan pada sesi opname aktif!`);
        }
    };

    // Save Physical Qty Handler
    const handleItemSave = (updatedItem: ReconciliationItem) => {
        setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));

        router.post(
            `/${tenantSlug}/stock-opname/verify`,
            {
                item_id: updatedItem.id,
                physical_qty: updatedItem.physical_qty,
                notes: updatedItem.notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Hasil hitung untuk ${updatedItem.sku} berhasil diperbarui!`);
                },
            },
        );
    };

    // Execute Adjustment Handler
    const handleExecuteAdjustment = () => {
        if (!initialSession?.id) {
            toast.error('Tidak ada sesi opname aktif untuk dieksekusi!');
            return;
        }

        if (confirm('Apakah Anda yakin ingin mengeksekusi adjustment stok ke database live WMS?')) {
            router.post(
                `/${tenantSlug}/stock-opname/adjust`,
                {
                    session_id: initialSession.id,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Adjustment stok berhasil dieksekusi ke database!');
                    },
                },
            );
        }
    };

    const handleExportPdf = () => {
        router.post(`/${tenantSlug}/stock-opname/export/pdf`);
    };

    const handleExportExcel = () => {
        router.post(`/${tenantSlug}/stock-opname/export/excel`);
    };

    return (
        <>
            <Head title={t("Stock Opname & Rekonsiliasi Audit")} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                <PageHeader
                    title={t("Stock Opname & Rekonsiliasi Audit")}
                    description={t("Kelola jadwal pemeriksaan fisik persediaan barang, verifikasi blind count, dan eksekusi penyesuaian stok otomatis.")}
                    renderAction={
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPdf}
                                className="h-9 gap-1.5 border-border text-xs rounded-xl"
                            >
                                <FileText size={15} className="text-red-500" /> {t("Export PDF")}</Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                                className="h-9 gap-1.5 border-border text-xs rounded-xl"
                            >
                                <FileSpreadsheet size={15} className="text-emerald-500" /> {t("Export Excel")}</Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPrintModalOpen(true)}
                                className="h-9 gap-1.5 border-border text-xs rounded-xl"
                            >
                                <Printer size={15} className="text-muted-foreground" /> {t("Cetak Blanko A4")}</Button>
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs rounded-xl gap-1.5"
                            >
                                <Plus size={16} /> {t("Buat Sesi Opname Baru")}</Button>
                        </div>
                    }
                />

                {/* ACTIVE SESSION HERO CARD */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4 text-card-foreground">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-lg font-bold text-foreground tracking-tight">
                                    {t("Stock Opname Sesi Aktif")}</h2>
                                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-md">
                                    {initialSession?.session_code || t("OPN-DRAFT")}
                                </span>
                                <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1.5 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {initialSession?.status || t("Active Audit")}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border font-medium text-foreground">
                                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{t("Zona Audit:")}{' '}<strong className="text-foreground font-semibold">{initialSession?.zone || t("Semua Zona")}</strong></span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border font-medium text-foreground">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{t("Gudang:")}{' '}<strong className="text-foreground font-semibold">{activeTenantName}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="h-9 px-3 bg-muted/60 border border-border rounded-xl flex items-center gap-2 text-xs font-semibold text-foreground self-start lg:self-auto">
                            <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{activeTenantName}</span>
                        </div>
                    </div>

                    {/* Barcode Quick Input Bar */}
                    <form onSubmit={handleScannerSubmit} className="pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <ScanBarcode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <Input
                                type="text"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder={t("Scan Barcode Rak (cth: A-01-01) atau Barcode SKU (cth: 8998866200114) untuk koreksi...")}
                                className="pl-9 pr-14 h-9 bg-background border-border text-xs font-mono font-medium rounded-xl"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                                {t("Enter")}</kbd>
                        </div>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs gap-2 flex-shrink-0"
                        >
                            <Check className="w-4 h-4" />
                            <span>{t("Verifikasi & Koreksi Fisik")}</span>
                        </Button>
                    </form>
                </div>

                {/* 4 STAT CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">{t("Cakupan Audit")}</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalSkus} <span className="text-xs font-normal text-muted-foreground">{t("SKU")}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {t("Total Saldo Buku:")}{' '}<strong className="font-mono text-foreground font-semibold">{totalSystemQty} {t("Unit")}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">{t("Fisik Cocok (Match)")}</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {matchedSkus} <span className="text-xs font-normal text-muted-foreground">{t("SKU")}</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                {matchPercentage}{t("% fisik terverifikasi 0 selisih")}</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">{t("Selisih Fisik (Variance)")}</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                                {netVariance > 0 ? `+${netVariance}` : netVariance} <span className="text-xs font-normal text-amber-600 dark:text-amber-400">{t("Unit")}</span>
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                {t("Defisit")}{' '}{deficitUnits} {t("Unit • Surplus +")}{surplusUnits} {t("Unit")}</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">{t("Status Rekonsiliasi")}</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Scale className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                {t("Menunggu Approval")}</div>
                            <div className="text-xs text-muted-foreground mt-1">{t("Siap dikomit ke database")}</div>
                        </div>
                    </div>
                </div>

                {/* FILTER BAR */}
                <TableFilter
                    search={search}
                    onSearchChange={(e) => setSearch(e.target.value)}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                >
                    <FilterDropdown
                        onApply={() => {}}
                        onReset={() => {
                            setSearch('');
                            setStatusFilter('all');
                        }}
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">{t("Status Selisih")}</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("Semua Status")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("Semua Status")}</SelectItem>
                                        <SelectItem value="match">{t("Match (Cocok)")}</SelectItem>
                                        <SelectItem value="defisit">{t("Defisit")}</SelectItem>
                                        <SelectItem value="surplus">{t("Surplus")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </FilterDropdown>
                </TableFilter>

                {/* RECONCILIATION TABLE */}
                <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden text-card-foreground">
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">{t("Lembar Rekonsiliasi Saldo Buku vs Hasil Hitung")}</h3>
                            <p className="text-xs text-muted-foreground">{t("Membaca saldo live inventory_stocks dibandingkan fisik aktual lapangan")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl text-xs font-mono">
                            <span className="px-2 py-0.5 font-semibold text-foreground">{filteredItems.length} {t("Baris Terpantau")}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-5">{"SKU / Barcode"}</th>
                                    <th className="py-3 px-5">{"Nama Barang & Batch"}</th>
                                    <th className="py-3 px-5">{"Rak"}</th>
                                    <th className="py-3 px-5 text-right">{"Stok Sistem"}</th>
                                    <th className="py-3 px-5 text-right">{"Fisik Lapangan"}</th>
                                    <th className="py-3 px-5 text-center">{"Selisih (Variance)"}</th>
                                    <th className="py-3 px-5 text-center">{"Status"}</th>
                                    <th className="py-3 px-4 text-center">{"Aksi"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground font-sans">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${
                                                item.status === 'Defisit'
                                                    ? 'bg-rose-50/20 dark:bg-rose-950/20 hover:bg-rose-50/40'
                                                    : item.status === 'Surplus'
                                                    ? 'bg-blue-50/20 dark:bg-blue-950/20 hover:bg-blue-50/40'
                                                    : 'hover:bg-muted/30'
                                            }`}
                                        >
                                            <td className="py-3 px-5 font-mono">
                                                <div className="font-bold text-blue-600 dark:text-blue-400">{item.sku}</div>
                                                <div className="text-[11px] text-muted-foreground">{item.barcode}</div>
                                            </td>
                                            <td className="py-3 px-5 font-sans">
                                                <div className="font-semibold text-foreground">{item.name}</div>
                                                <div className="text-[11px] text-muted-foreground font-mono">
                                                    {item.batch} {t("• Exp:")}{' '}{item.exp_date}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 font-mono">
                                                <span className="px-2 py-0.5 bg-muted/60 border border-border rounded-lg font-semibold text-foreground">
                                                    {item.rack}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-right text-muted-foreground">
                                                {item.system_qty} {item.unit}
                                            </td>
                                            <td
                                                className={`py-3 px-5 text-right font-bold ${
                                                    item.status === 'Match'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : item.status === 'Defisit'
                                                        ? 'text-rose-600 dark:text-rose-400'
                                                        : 'text-blue-600 dark:text-blue-400'
                                                }`}
                                            >
                                                {item.physical_qty} {item.unit}
                                            </td>
                                            <td className="py-3 px-5 text-center font-mono">
                                                <span
                                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                                                        item.status === 'Match'
                                                            ? 'bg-muted text-muted-foreground border border-border'
                                                            : item.status === 'Defisit'
                                                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                                    }`}
                                                >
                                                    {item.variance > 0 ? `+${item.variance}` : item.variance} {item.unit}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-center font-sans">
                                                <span
                                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                                                        item.status === 'Match'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                            : item.status === 'Defisit'
                                                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setVerifModalItem(item)}
                                                    className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                    title={t("Koreksi Hitungan")}
                                                >
                                                    <Edit3 className="w-4 h-4 text-blue-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-muted-foreground font-sans">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Boxes className="w-8 h-8 text-muted-foreground/60 stroke-1" />
                                                <p className="text-xs font-semibold text-foreground">
                                                    {t("Belum ada sesi stock opname aktif atau data barang terdaftar.")}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {t("Klik tombol")}{' '}<strong className="text-blue-600 dark:text-blue-400 font-semibold">{t("\"+ Buat Sesi Opname Baru\"")}</strong> {t("untuk memulai inisiasi audit.")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="p-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                            <span>{t("Buku:")}{' '}<strong className="text-foreground">{totalSystemQty}</strong></span>
                            <span className="text-border">{t("•")}</span>
                            <span>{t("Fisik:")}{' '}<strong className="text-foreground">{totalSystemQty + netVariance}</strong></span>
                            <span className="text-border">{t("•")}</span>
                            <span>{t("Defisit:")}{' '}<strong className="text-rose-600 dark:text-rose-400">{deficitUnits}</strong></span>
                            <span className="text-border">{t("•")}</span>
                            <span>{t("Surplus:")}{' '}<strong className="text-blue-600 dark:text-blue-400">{t("+")}{surplusUnits}</strong></span>
                            <span className="text-border">{t("•")}</span>
                            <span>
                                {t("Net Variance:")}{' '}
                                <strong className={`font-bold ${netVariance === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {netVariance > 0 ? `+${netVariance}` : netVariance} {t("Unit")}</strong>
                            </span>
                        </div>
                        <Button
                            type="button"
                            onClick={handleExecuteAdjustment}
                            className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span>{t("Approve & Eksekusi Adjustment")}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <CreateOpnameModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <VerificationModal
                isOpen={Boolean(verifModalItem)}
                item={verifModalItem}
                onClose={() => setVerifModalItem(null)}
                onSaveSuccess={handleItemSave}
            />

            {initialSession && (
                <PrintSheetModal
                    isOpen={isPrintModalOpen}
                    session={initialSession}
                    items={items}
                    onClose={() => setIsPrintModalOpen(false)}
                />
            )}
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: "Warehouse & Stocks", href: '#' },
        { title: "Stock Opname & Rekonsiliasi Audit", href: '#' },
    ],
};
