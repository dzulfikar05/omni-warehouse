import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    AlertTriangle,
    ArrowLeft,
    Boxes,
    Building2,
    Check,
    CheckCircle2,
    CheckCheck,
    MoreHorizontal,
    Printer,
    ScanBarcode,
    Truck,
    User,
    Warehouse as WarehouseIcon,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/context/language-context';
import type { InboundItem, InboundManifest, InboundStatus } from '@/types/inbound';
import { PutawayDrawer } from './components/PutawayDrawer';
import { BapPreviewModal } from './components/BapPreviewModal';
import { CommitModal } from './components/CommitModal';
import { HoldSessionModal } from './components/HoldSessionModal';

interface InboundShowProps {
    manifest: InboundManifest;
    items: InboundItem[];
}

export default function Show({
    manifest: initialManifest,
    items: initialItems,
}: InboundShowProps) {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;

    const [manifest, setManifest] = useState<InboundManifest>(initialManifest);
    const [items, setItems] = useState<InboundItem[]>(initialItems || []);
    const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'process' | 'issue'>('all');
    const [barcodeInput, setBarcodeInput] = useState<string>('');
    const [feedbackBanner, setFeedbackBanner] = useState<{
        text: string;
        type: 'blue' | 'amber' | 'emerald';
    } | null>(null);

    // Modal & Drawer States
    const [selectedDrawerItem, setSelectedDrawerItem] = useState<InboundItem | null>(null);
    const [isBapModalOpen, setIsBapModalOpen] = useState<boolean>(false);
    const [isCommitModalOpen, setIsCommitModalOpen] = useState<boolean>(false);
    const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const activeTenantName =
        current_tenant?.name ||
        auth?.user?.tenant_name ||
        auth?.user?.tenant?.name ||
        'Tenant Portal';

    // Statistics Derived
    const totalLineSku = items.length;
    const totalGoodUnits = items.reduce((acc, curr) => acc + curr.good_qty, 0);
    const totalDamagedUnits = items.reduce((acc, curr) => acc + curr.damaged_qty, 0);
    const totalPoUnits = items.reduce((acc, curr) => acc + curr.po_qty, 0);
    const progressPct =
        totalPoUnits > 0
            ? (((totalGoodUnits + totalDamagedUnits) / totalPoUnits) * 100).toFixed(1)
            : '0';

    // Table Filters
    const filteredItems = items.filter((item) => {
        if (filterTab === 'valid') return item.status === 'valid';
        if (filterTab === 'process') return item.status === 'process';
        if (filterTab === 'issue') return item.status === 'issue';
        return true;
    });

    const validCount = items.filter((i) => i.status === 'valid').length;
    const processCount = items.filter((i) => i.status === 'process').length;
    const issueCount = items.filter((i) => i.status === 'issue').length;

    // Barcode Scan Verification Handler
    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        const foundIndex = items.findIndex(
            (i) => i.barcode === code || i.sku.toLowerCase() === code.toLowerCase(),
        );

        if (foundIndex !== -1) {
            const foundItem = items[foundIndex];
            const updatedItems = [...items];

            if (foundItem.good_qty < foundItem.po_qty) {
                const newGood = foundItem.good_qty + 10;
                const cappedGood = Math.min(newGood, foundItem.po_qty);
                const isFullyValid = cappedGood === foundItem.po_qty && foundItem.damaged_qty === 0;

                updatedItems[foundIndex] = {
                    ...foundItem,
                    good_qty: cappedGood,
                    status: isFullyValid ? 'valid' : 'process',
                    status_label: isFullyValid
                        ? 'Sesuai / Valid'
                        : `Proses Scan (${Math.round((cappedGood / foundItem.po_qty) * 100)}%)`,
                };

                setItems(updatedItems);
                setFeedbackBanner({
                    text: `Scanned: ${foundItem.product_name} (+10 Unit tervalidasi).`,
                    type: 'blue',
                });
                toast.success(`Berhasil scan ${foundItem.sku}!`);
            } else {
                setFeedbackBanner({
                    text: `SKU ${foundItem.sku} sudah memenuhi kuota PO (${foundItem.po_qty} Unit).`,
                    type: 'emerald',
                });
            }

            router.post(
                `/${tenantSlug}/transactions/inbound/verify-barcode`,
                { barcode: code },
                { preserveScroll: true },
            );
        } else {
            setFeedbackBanner({
                text: `Barcode SKU "${code}" tidak ada dalam Manifest Inbound ini!`,
                type: 'amber',
            });
            toast.error(`Barcode ${code} tidak ditemukan!`);
        }

        setBarcodeInput('');
    };

    // Save Putaway Drawer Allocation
    const handlePutawaySave = (
        goodQty: number,
        damagedQty: number,
        rack: string,
        note: string,
    ) => {
        if (!selectedDrawerItem) return;

        const updated = items.map((it) => {
            if (it.id === selectedDrawerItem.id) {
                let newStatus: InboundStatus = 'pending';
                let label = 'Menunggu Scan';

                if (damagedQty > 0) {
                    newStatus = 'issue';
                    label = 'Ada Selisih / BAP';
                } else if (goodQty >= it.po_qty) {
                    newStatus = 'valid';
                    label = 'Sesuai / Valid';
                } else if (goodQty > 0) {
                    newStatus = 'process';
                    label = `Proses Scan (${Math.round((goodQty / it.po_qty) * 100)}%)`;
                }

                return {
                    ...it,
                    good_qty: goodQty,
                    damaged_qty: damagedQty,
                    target_rack: rack,
                    damage_note: note,
                    status: newStatus,
                    status_label: label,
                };
            }
            return it;
        });

        setItems(updated);
        toast.success(`Alokasi rak & fisik untuk ${selectedDrawerItem.sku} diperbarui!`);

        router.post(
            `/${tenantSlug}/transactions/inbound/putaway`,
            {
                item_id: selectedDrawerItem.id,
                good_qty: goodQty,
                damaged_qty: damagedQty,
                target_rack: rack,
            },
            { preserveScroll: true },
        );
    };

    // Commit Inbound to Database
    const handleCommit = () => {
        setIsCommitModalOpen(false);
        router.post(
            `/${tenantSlug}/transactions/inbound/commit`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setManifest((prev) => ({ ...prev, status: 'CLOSED' }));
                    toast.success('Inbound berhasil disave & stok fisik diperbarui ke database!');
                },
            },
        );
    };

    // Hold Session
    const handleHoldSession = (reason: string) => {
        router.post(
            `/${tenantSlug}/transactions/inbound/hold`,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setManifest((prev) => ({ ...prev, status: 'HOLD' }));
                    setFeedbackBanner({
                        text: `Sesi bongkar di-hold. Alasan: ${reason}`,
                        type: 'amber',
                    });
                    toast.warning('Sesi Inbound berhasil di-hold.');
                },
            },
        );
    };

    return (
        <>
            <Head title={`Workspace Inbound ${manifest.manifest_code}`} />

            <div className="space-y-6 p-4 sm:p-6">
                {/* HERO BANNER CARD */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4 text-card-foreground">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Title & Status Header */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <Link
                                    href={`/${tenantSlug}/transactions/inbound`}
                                    className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors mr-1 cursor-pointer"
                                    title={t("Kembali ke Daftar Manifest Inbound")}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <h1 className="text-xl font-bold text-foreground tracking-tight">
                                    {t("Inbound Receiving & Putaway")}</h1>
                                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-md">
                                    {manifest.manifest_code}
                                </span>
                                <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1.5 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {manifest.status}
                                </span>
                            </div>

                            {/* Clean metadata pills row */}
                            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border font-medium text-foreground">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{manifest.supplier_name}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border font-medium text-foreground">
                                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>
                                        {t("Armada:")}{' '}
                                        <strong className="font-mono text-foreground font-semibold">
                                            {manifest.vehicle_no !== '-' && manifest.vehicle_no ? manifest.vehicle_no : t("Belum Terdaftar")}
                                        </strong>
                                        {manifest.vehicle_type !== '-' && manifest.vehicle_type ? ` (${manifest.vehicle_type})` : ''}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border font-medium text-foreground">
                                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>
                                        {t("Sopir:")}{' '}
                                        <strong className="text-foreground font-semibold">
                                            {manifest.driver_name !== '-' && manifest.driver_name ? manifest.driver_name : t("Belum Ada")}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Topbar Actions */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="h-9 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{t("Mobile Operator Sync Ready")}</span>
                            </div>

                            <div className="h-9 px-3 bg-muted/60 border border-border rounded-xl flex items-center gap-2 text-xs font-semibold text-foreground">
                                <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{activeTenantName}</span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsBapModalOpen(true)}
                                className="h-9 px-3 border-border rounded-xl text-xs font-semibold gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{t("Cetak Bukti Penerimaan (BAP)")}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Scanner Input Bar */}
                    <form
                        onSubmit={handleScanSubmit}
                        className="pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-3"
                    >
                        <div className="relative flex-1 w-full">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <ScanBarcode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <Input
                                type="text"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder={t("Scan Barcode SKU lalu tekan Enter...")}
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
                            <span>{t("Verifikasi Item")}</span>
                        </Button>
                    </form>

                    {/* Feedback Scan Notification Banner */}
                    {feedbackBanner && (
                        <div
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                                feedbackBanner.type === 'blue'
                                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                                    : feedbackBanner.type === 'emerald'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            }`}
                        >
                            <div className="flex items-center gap-2 font-medium">
                                <span>{feedbackBanner.text}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFeedbackBanner(null)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* STAT CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {t("Total Line SKU")}</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalLineSku}{' '}
                                <span className="text-xs font-normal text-muted-foreground">{t("SKU")}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {t("Total pesanan PO:")}{' '}
                                <strong className="font-mono text-foreground font-semibold">
                                    {totalPoUnits} {t("Units")}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {t("Fisik Tervalidasi Baik")}</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalGoodUnits}{' '}
                                <span className="text-xs font-normal text-muted-foreground">{t("Units")}</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                {t("Siap alokasi ke rak penyimpanan")}</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {t("Anomali / Rusak")}</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalDamagedUnits}{' '}
                                <span className="text-xs font-normal text-muted-foreground">{t("Units")}</span>
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                {t("Draft Berita Acara (BAP)")}</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-36 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {t("Progress Manifest & Dock")}</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Truck className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-foreground flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                {manifest.status === 'CLOSED' ? t("Selesai / Closed") : `Receiving (${progressPct}%)`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {t("Dock Unloading:")}{' '}
                                <strong className="font-mono text-foreground">
                                    {manifest.dock_bay !== '-' ? manifest.dock_bay : t("BAY-01")}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PUTAWAY LEDGER TABLE */}
                <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden text-card-foreground">
                    {/* Header & Filter */}
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">
                                {t("Ledger Verifikasi Fisik & Alokasi Putaway Rak")}</h2>
                            <p className="text-xs text-muted-foreground">
                                {t("Daftar item masuk PO untuk dialokasikan ke rak gudang")}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFilterTab('all')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    filterTab === 'all'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t("Semua (")}{items.length}{t(")")}</button>
                            <button
                                type="button"
                                onClick={() => setFilterTab('valid')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    filterTab === 'valid'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t("Sesuai (")}{validCount}{t(")")}</button>
                            <button
                                type="button"
                                onClick={() => setFilterTab('process')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    filterTab === 'process'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t("Proses (")}{processCount}{t(")")}</button>
                            <button
                                type="button"
                                onClick={() => setFilterTab('issue')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    filterTab === 'issue'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t("Selisih/BAP (")}{issueCount}{t(")")}</button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-5 whitespace-nowrap">{t("SKU / Barcode")}</th>
                                    <th className="py-3 px-5 whitespace-nowrap">
                                        {t("Deskripsi Produk & Kategori")}</th>
                                    <th className="py-3 px-5 whitespace-nowrap">
                                        {t("Batch & Kadaluarsa")}</th>
                                    <th className="py-3 px-5 text-right whitespace-nowrap">
                                        {t("PO Target")}</th>
                                    <th className="py-3 px-5 text-right whitespace-nowrap">
                                        {t("Fisik Diterima")}</th>
                                    <th className="py-3 px-5 whitespace-nowrap">{t("Rekomendasi Rak")}</th>
                                    <th className="py-3 px-5 text-center whitespace-nowrap">
                                        {t("Status Validasi")}</th>
                                    <th className="py-3 px-4 text-center whitespace-nowrap">{t("Aksi")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${
                                                item.status === 'issue'
                                                    ? 'bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/50'
                                                    : 'hover:bg-muted/30'
                                            }`}
                                        >
                                            <td className="py-3.5 px-5">
                                                <div className="font-bold font-mono text-blue-600 dark:text-blue-400">
                                                    {item.sku}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground font-mono">
                                                    {item.barcode}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="font-semibold text-foreground">
                                                    {item.product_name}
                                                </div>
                                                <div
                                                    className={`text-[11px] ${
                                                        item.status === 'issue'
                                                            ? 'text-red-500 font-semibold'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {item.damage_note ||
                                                        `Kategori: ${item.category}`}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="font-semibold text-foreground font-mono">
                                                    {item.batch_no}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground font-mono">
                                                    {t("Exp:")}{' '}{item.exp_date}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-right font-mono font-semibold text-muted-foreground">
                                                {item.po_qty} {item.unit}
                                            </td>
                                            <td className="py-3.5 px-5 text-right font-mono font-semibold">
                                                {item.status === 'valid' && (
                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                        {item.good_qty} {item.unit}
                                                    </span>
                                                )}
                                                {item.status === 'process' && (
                                                    <span className="text-blue-600 dark:text-blue-400">
                                                        {item.good_qty} {t("/")}{' '}{item.po_qty} {item.unit}
                                                    </span>
                                                )}
                                                {item.status === 'issue' && (
                                                    <>
                                                        <span className="text-foreground">
                                                            {item.good_qty} {t("Baik")}</span>{' '}
                                                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                                                            {t("(-")}{item.damaged_qty} {t("Rusak)")}</span>
                                                    </>
                                                )}
                                                {item.status === 'pending' && (
                                                    <span className="text-muted-foreground">
                                                        {t("0 /")}{' '}{item.po_qty} {item.unit}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg font-mono font-semibold text-blue-700 dark:text-blue-300">
                                                        {item.target_rack}
                                                    </span>
                                                    {item.status === 'issue' && (
                                                        <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg font-mono text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                                                            {t("QUARANTINE")}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium border ${
                                                        item.status === 'valid'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                            : item.status === 'process'
                                                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                              : item.status === 'issue'
                                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                                : 'bg-muted text-muted-foreground border-border'
                                                    }`}
                                                >
                                                    {item.status_label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDrawerItem(item)}
                                                    className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                                    title={t("Kelola Alokasi Rak & Inspeksi")}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Boxes className="w-8 h-8 text-muted-foreground/60 stroke-1" />
                                                <p className="text-xs font-semibold text-foreground">
                                                    {t("Belum ada item penerimaan barang (Inbound) yang aktif saat ini.")}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {t("Gunakan scanner di atas untuk verifikasi barang masuk PO.")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Sticky Footer */}
                    <div className="p-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                                {t("Total Dipesan:")}{' '}
                                <strong className="font-mono text-foreground">
                                    {totalPoUnits} {t("Unit")}</strong>
                            </span>
                            <span className="text-border">{t("•")}</span>
                            <span>
                                {t("Tervalidasi:")}{' '}
                                <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                                    {totalGoodUnits} {t("Unit")}</strong>
                            </span>
                            <span className="text-border">{t("•")}</span>
                            <span>
                                {t("Rusak/BAP:")}{' '}
                                <strong className="font-mono text-amber-600 dark:text-amber-400">
                                    {totalDamagedUnits} {t("Unit")}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsHoldModalOpen(true)}
                                className="w-1/2 sm:w-auto h-9 px-4 border-border rounded-xl text-xs font-semibold"
                            >
                                {t("Batal / Hold Sesi")}</Button>
                            <Button
                                type="button"
                                onClick={() => setIsCommitModalOpen(true)}
                                className="w-1/2 sm:w-auto h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md gap-2"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>{t("Simpan ke Rak & Tambah Stok")}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-over Drawer & Modals */}
            <PutawayDrawer
                isOpen={Boolean(selectedDrawerItem)}
                onClose={() => setSelectedDrawerItem(null)}
                item={selectedDrawerItem}
                onSave={handlePutawaySave}
            />

            <BapPreviewModal
                isOpen={isBapModalOpen}
                onClose={() => setIsBapModalOpen(false)}
                manifest={manifest}
                items={items}
            />

            <CommitModal
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
                onConfirm={handleCommit}
                manifest={{
                    ...manifest,
                    good_units: totalGoodUnits,
                    damaged_units: totalDamagedUnits,
                }}
            />

            <HoldSessionModal
                isOpen={isHoldModalOpen}
                onClose={() => setIsHoldModalOpen(false)}
                onConfirm={handleHoldSession}
            />
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: "Transaction", href: '#' },
        { title: "Inbound Management", href: '/transactions/inbound' },
        { title: "Workspace Receiving & Putaway", href: '#' },
    ],
};
