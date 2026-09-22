import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Boxes,
    CheckCircle2,
    AlertTriangle,
    Scale,
    Warehouse as WarehouseIcon,
    Printer,
    Plus,
    ScanBarcode,
    Check,
    Edit3,
    CheckCheck,
} from 'lucide-react';
import { ReconciliationItem, StockOpnamePageProps } from '@/types/stock-opname';
import { CreateOpnameModal } from './components/CreateOpnameModal';
import { VerificationModal } from './components/VerificationModal';
import { PrintSheetModal } from './components/PrintSheetModal';

export default function Index({ session: initialSession, items: initialItems }: StockOpnamePageProps) {
    const { current_tenant, auth, flash } = usePage().props as any;

    const [items, setItems] = useState<ReconciliationItem[]>(initialItems || []);
    const [barcodeInput, setBarcodeInput] = useState<string>('');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [verifModalItem, setVerifModalItem] = useState<ReconciliationItem | null>(null);

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const activeTenantName =
        current_tenant?.name ||
        auth?.user?.tenant_name ||
        auth?.user?.tenant?.name ||
        initialSession.warehouse_name ||
        'Gudang Utama';

    // Derived Statistics
    const totalSkus = items.length;
    const totalSystemQty = items.reduce((acc, curr) => acc + curr.system_qty, 0);
    const matchedSkus = items.filter((item) => item.variance === 0).length;
    const deficitUnits = items.reduce((acc, curr) => (curr.variance < 0 ? acc + curr.variance : acc), 0);
    const surplusUnits = items.reduce((acc, curr) => (curr.variance > 0 ? acc + curr.variance : acc), 0);
    const netVariance = deficitUnits + surplusUnits;
    const matchPercentage = totalSkus > 0 ? ((matchedSkus / totalSkus) * 100).toFixed(1) : '0';

    // Scanner Quick Bar Input Handler
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

    // Save Updated Physical Item Handler
    const handleItemSave = (updatedItem: ReconciliationItem) => {
        setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));

        router.post(
            `/${tenantSlug}/stock-opname/verify`,
            {
                item_id: updatedItem.id,
                physical_qty: updatedItem.physical_qty,
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
    };

    return (
        <>
            <Head title="Stock Opname & Rekonsiliasi Audit" />

            <div className="p-6 flex flex-col gap-6 font-sans text-stone-900 bg-[#FAFAF9] min-h-screen">
                {/* HERO BANNER CARD */}
                <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                                    Stock Opname Sesi Aktif
                                </h1>
                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                    {initialSession.session_code}
                                </span>
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1.5 font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {initialSession.status}
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                                {initialSession.zone} • {activeTenantName} ({initialSession.warehouse_code})
                            </p>
                        </div>

                        {/* Top Action Bar */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="h-9 px-3 bg-stone-100 border border-stone-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-stone-800">
                                <WarehouseIcon className="w-3.5 h-3.5 text-stone-500" />
                                <span>{activeTenantName}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPrintModalOpen(true)}
                                className="h-9 px-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5 text-stone-500" />
                                <span>Cetak Blanko A4</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Buat Sesi Opname Baru</span>
                            </button>
                        </div>
                    </div>

                    {/* Scanner / Barcode Quick Bar */}
                    <form onSubmit={handleScannerSubmit} className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                                <ScanBarcode className="w-4 h-4 text-blue-600" />
                            </div>
                            <input
                                type="text"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder="Scan Barcode Rak (cth: A-01-01) atau Barcode SKU (cth: 8998866200114) untuk input/koreksi fisik..."
                                className="w-full pl-9 pr-14 py-2 bg-stone-50 hover:bg-white border border-stone-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 rounded-lg text-xs font-mono font-medium text-stone-900 placeholder-stone-400 outline-none transition-all"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-white border border-stone-200 text-stone-500 px-1.5 py-0.5 rounded font-bold shadow-2xs">
                                Enter
                            </kbd>
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto h-9 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs flex-shrink-0 cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span>Verifikasi & Koreksi Fisik</span>
                        </button>
                    </form>
                </div>

                {/* 4 METRIC CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Cakupan Audit</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 tracking-tight">
                                {totalSkus} <span className="text-xs font-normal text-stone-500">SKU</span>
                            </div>
                            <div className="text-xs text-stone-500 mt-1">
                                Total Saldo Buku: <strong className="font-mono text-stone-800">{totalSystemQty} Unit</strong>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Fisik Cocok (Match)</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 tracking-tight">
                                {matchedSkus} <span className="text-xs font-normal text-stone-500">SKU</span>
                            </div>
                            <div className="text-xs text-emerald-600 font-medium mt-1">
                                {matchPercentage}% fisik terverifikasi 0 selisih
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Selisih Fisik (Variance)</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-700 tracking-tight">
                                {netVariance > 0 ? `+${netVariance}` : netVariance} <span className="text-xs font-normal text-amber-700">Unit</span>
                            </div>
                            <div className="text-xs text-amber-700 font-medium mt-1">
                                Defisit {deficitUnits} Unit • Surplus +{surplusUnits} Unit
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Status Rekonsiliasi</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Scale className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Menunggu Approval
                            </div>
                            <div className="text-xs text-stone-500 mt-1">Siap dikomit ke database</div>
                        </div>
                    </div>
                </div>

                {/* RECONCILIATION LEDGER TABLE */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-stone-900">Lembar Rekonsiliasi Saldo Buku vs Hasil Hitung</h2>
                            <p className="text-xs text-stone-500">Membaca saldo live inventory_stocks dibandingkan fisik aktual lapangan</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs font-mono">
                            <span className="px-2 py-0.5 font-semibold text-stone-700">{items.length} Baris Terpantau</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                                <tr>
                                    <th className="py-3 px-5">SKU / Barcode</th>
                                    <th className="py-3 px-5">Nama Barang & Batch</th>
                                    <th className="py-3 px-5">Rak</th>
                                    <th className="py-3 px-5 text-right">Stok Sistem</th>
                                    <th className="py-3 px-5 text-right">Fisik Lapangan</th>
                                    <th className="py-3 px-5 text-center">Selisih (Variance)</th>
                                    <th className="py-3 px-5 text-center">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-800 font-sans">
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${
                                                item.status === 'Defisit'
                                                    ? 'bg-rose-50/20 hover:bg-rose-50/40'
                                                    : item.status === 'Surplus'
                                                    ? 'bg-blue-50/20 hover:bg-blue-50/40'
                                                    : 'hover:bg-stone-50/70'
                                            }`}
                                        >
                                            <td className="py-3 px-5 font-mono">
                                                <div className="font-bold text-blue-600">{item.sku}</div>
                                                <div className="text-[11px] text-stone-400">{item.barcode}</div>
                                            </td>
                                            <td className="py-3 px-5 font-sans">
                                                <div className="font-semibold text-stone-900">{item.name}</div>
                                                <div className="text-[11px] text-stone-500 font-mono">
                                                    {item.batch} • Exp: {item.exp_date}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 font-mono">
                                                <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded font-semibold text-stone-700">
                                                    {item.rack}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-right text-stone-600">
                                                {item.system_qty} {item.unit}
                                            </td>
                                            <td
                                                className={`py-3 px-5 text-right font-bold ${
                                                    item.status === 'Match'
                                                        ? 'text-emerald-700'
                                                        : item.status === 'Defisit'
                                                        ? 'text-rose-600'
                                                        : 'text-blue-700'
                                                }`}
                                            >
                                                {item.physical_qty} {item.unit}
                                            </td>
                                            <td className="py-3 px-5 text-center font-mono">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                        item.status === 'Match'
                                                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                                                            : item.status === 'Defisit'
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    }`}
                                                >
                                                    {item.variance > 0 ? `+${item.variance}` : item.variance} {item.unit}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-center font-sans">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                                        item.status === 'Match'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : item.status === 'Defisit'
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setVerifModalItem(item)}
                                                    className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                                                    title="Koreksi Hitungan"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-stone-400 font-sans">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Boxes className="w-8 h-8 text-stone-300 stroke-1" />
                                                <p className="text-xs font-semibold text-stone-700">
                                                    Belum ada sesi stock opname aktif atau data barang terdaftar.
                                                </p>
                                                <p className="text-[11px] text-stone-400">
                                                    Klik tombol <strong className="text-blue-600 font-semibold">"+ Buat Sesi Opname Baru"</strong> untuk memulai inisiasi audit.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Sticky Footer */}
                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-stone-600 font-mono flex-wrap">
                            <span>Buku: <strong className="text-stone-900">{totalSystemQty}</strong></span>
                            <span className="text-stone-300">•</span>
                            <span>Fisik: <strong className="text-stone-900">{totalSystemQty + netVariance}</strong></span>
                            <span className="text-stone-300">•</span>
                            <span>Defisit: <strong className="text-rose-600">{deficitUnits}</strong></span>
                            <span className="text-stone-300">•</span>
                            <span>Surplus: <strong className="text-blue-600">+{surplusUnits}</strong></span>
                            <span className="text-stone-300">•</span>
                            <span>
                                Net Variance:{' '}
                                <strong className={`font-bold ${netVariance === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {netVariance > 0 ? `+${netVariance}` : netVariance} Unit
                                </strong>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleExecuteAdjustment}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span>Approve & Eksekusi Adjustment</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            <CreateOpnameModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmitSuccess={() => toast.success('Tiket Sesi Opname Baru berhasil diterbitkan!')}
            />

            <VerificationModal
                isOpen={Boolean(verifModalItem)}
                item={verifModalItem}
                onClose={() => setVerifModalItem(null)}
                onSaveSuccess={handleItemSave}
            />

            <PrintSheetModal
                isOpen={isPrintModalOpen}
                session={initialSession}
                items={items}
                onClose={() => setIsPrintModalOpen(false)}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Stock Opname & Rekonsiliasi Audit', href: '#' },
    ],
};
