import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Layers,
    Warehouse as WarehouseIcon,
    Package,
    Search,
    Edit3,
    QrCode,
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    Boxes,
    Calendar,
    User,
    ChevronRight,
    Printer,
    X,
    Loader2,
    MapPin,
    CheckCircle2,
    ShieldCheck,
    Hash,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Warehouse {
    id: number;
    name: string;
    code: string;
}

interface Location {
    id: number;
    rack_code: string;
    zone: string | null;
    warehouse_id: number;
    warehouse: Warehouse;
    created_at: string;
    updated_at: string;
}

interface StockItem {
    id: number;
    sku_id: number;
    sku_code: string;
    barcode: string | null;
    product_name: string;
    category_name: string | null;
    quantity: number;
    batch_number: string | null;
    created_at: string;
}

interface MovementLog {
    transaction_id: number;
    reference_no: string;
    type: string;
    status: string;
    created_at: string;
    operator_name: string;
    sku_code: string;
    product_name: string;
    quantity: number;
    to_location_id: number | null;
    from_location_id: number | null;
}

interface Props {
    location: Location;
    stocks: StockItem[];
    movements: MovementLog[];
}

// ─── Zone Color Utility (Light & Dark mode compatible) ───────────────────────

const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    default:       { bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-700 dark:text-stone-300', border: 'border-stone-200 dark:border-stone-700' },
    'fast-moving': { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    cold:          { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    hazardous:     { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    display:       { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    bulk:          { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
};

function getZoneBadge(zone: string | null) {
    if (!zone) return ZONE_COLORS.default;
    const key = Object.keys(ZONE_COLORS).find((k) => zone.toLowerCase().includes(k));
    return key ? ZONE_COLORS[key] : ZONE_COLORS.default;
}

export default function LocationShow({ location, stocks = [], movements = [] }: Props) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const [itemSearch, setItemSearch]             = useState('');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen]   = useState(false);

    // Form for editing location
    const { data, setData, put, processing } = useForm({
        warehouse_id: String(location.warehouse_id),
        rack_code:    location.rack_code,
        zone:         location.zone || '',
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/${tenantSlug}/locations/${location.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                toast.success('Detail lokasi rak berhasil diperbarui!');
            },
        });
    };

    // Filter stocks inside rack
    const filteredStocks = useMemo(() => {
        return stocks.filter((st) => {
            const matchesSearch =
                st.sku_code.toLowerCase().includes(itemSearch.toLowerCase()) ||
                st.product_name.toLowerCase().includes(itemSearch.toLowerCase()) ||
                (st.batch_number && st.batch_number.toLowerCase().includes(itemSearch.toLowerCase())) ||
                (st.category_name && st.category_name.toLowerCase().includes(itemSearch.toLowerCase()));
            return matchesSearch;
        });
    }, [stocks, itemSearch]);

    // Derived Metrics
    const totalQty = useMemo(() => stocks.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [stocks]);
    const totalSkuCount = stocks.length;
    const zoneBadge = getZoneBadge(location.zone);

    return (
        <>
            <Head title={`Rak ${location.rack_code} - Detail Lokasi`} />

            <div className="p-6 flex flex-col gap-6 font-sans text-stone-900 dark:text-stone-100 bg-[#FAFAF9] dark:bg-stone-950 min-h-screen">
                
                {/* ── BREADCRUMB & HEADER TOP BAR ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                            <Link
                                href={`/${tenantSlug}/locations`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Lokasi Rak</span>
                            </Link>
                            <ChevronRight className="w-3 h-3 text-stone-300 dark:text-stone-600" />
                            <span className="text-stone-700 dark:text-stone-300 font-medium">{location.warehouse?.name}</span>
                            <ChevronRight className="w-3 h-3 text-stone-300 dark:text-stone-600" />
                            <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">{location.rack_code}</span>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 font-mono">
                                {location.rack_code}
                            </h1>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${zoneBadge.bg} ${zoneBadge.text} ${zoneBadge.border}`}
                            >
                                {location.zone || 'General Storage Zone'}
                            </span>
                            <span className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                                <WarehouseIcon className="w-3.5 h-3.5 text-stone-400" />
                                {location.warehouse?.name} ({location.warehouse?.code})
                            </span>
                        </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsPrintModalOpen(true)}
                            className="h-9 px-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                            <span>Cetak Label Barcode</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(true)}
                            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Lokasi Rak</span>
                        </button>
                    </div>
                </div>

                {/* ── METRIC STAT CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total SKU */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-800 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                Total Varian SKU
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Boxes className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight font-mono">
                                {totalSkuCount} <span className="text-xs font-normal text-stone-400">Varian</span>
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                Terdaftar di rak ini
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Total Qty */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                Total Stok Fisik
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight font-mono">
                                {totalQty.toLocaleString('id-ID')}{' '}
                                <span className="text-xs font-normal text-stone-400">Pcs</span>
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                                Kuantitas fisik barang
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Status Okupansi Rak */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                Status Okupansi Rak
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                {totalSkuCount > 0 ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Terisi ({totalSkuCount} SKU)
                                    </span>
                                ) : (
                                    <span className="text-stone-400 italic">Kosong (Siap Diisi)</span>
                                )}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                Siap di-scan oleh Mobile Picker
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Tanggal Registrasi */}
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-800 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                Tanggal Registrasi
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                                {new Date(location.created_at).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                                Lokasi Rak Terverifikasi
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── SPESIFIKASI INFORMASI LOKASI RAK ── */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs flex flex-col gap-4">
                    <div className="pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Informasi Parameter Spesifikasi Lokasi Rak
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                Detail konfigurasi sistem WMS untuk rak penyimpanan fisik.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40">
                            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                Kode Identitas Rak
                            </div>
                            <div className="text-base font-bold font-mono text-stone-900 dark:text-stone-100">
                                {location.rack_code}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1">Unique WMS Location Tag</p>
                        </div>

                        <div className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40">
                            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                Kategori Zona Storage
                            </div>
                            <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                                {location.zone || 'General Storage Zone'}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1">Pemetaan Area Fisik Gudang</p>
                        </div>

                        <div className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40">
                            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <WarehouseIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Gudang Induk
                            </div>
                            <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                                {location.warehouse?.name} ({location.warehouse?.code})
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1">Unit Bangunan Operasional</p>
                        </div>
                    </div>
                </div>

                {/* ── DETAILED STOCK TABLE SECTION WITH REALTIME SEARCH ── */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-xs flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Rincian Barang & Inventori di Rak {location.rack_code}
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                Gunakan pencarian real-time di bawah untuk memfilter SKU atau nomor batch barang.
                            </p>
                        </div>

                        {/* Real-time Search Box */}
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                placeholder="Filter real-time SKU / Nama Barang..."
                                className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-blue-600 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none transition-all"
                            />
                            {itemSearch && (
                                <button
                                    onClick={() => setItemSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 rounded-full cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-950/50 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="py-3.5 px-5">Kode SKU / Barcode</th>
                                    <th className="py-3.5 px-5">Nama Barang & Kategori</th>
                                    <th className="py-3.5 px-5">No. Batch / Lot</th>
                                    <th className="py-3.5 px-5 text-right">Stok Fisik</th>
                                    <th className="py-3.5 px-5 text-center">Status Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
                                {filteredStocks.length > 0 ? (
                                    filteredStocks.map((item) => (
                                        <tr key={item.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors">
                                            {/* SKU & Barcode */}
                                            <td className="py-3.5 px-5 font-mono">
                                                <div className="font-bold text-blue-700 dark:text-blue-400 text-xs">
                                                    {item.sku_code}
                                                </div>
                                                {item.barcode && (
                                                    <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                                                        {item.barcode}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Name & Category */}
                                            <td className="py-3.5 px-5">
                                                <div className="font-semibold text-stone-900 dark:text-stone-100 text-xs">
                                                    {item.product_name}
                                                </div>
                                                <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                                    {item.category_name || 'Umum'}
                                                </div>
                                            </td>

                                            {/* Batch */}
                                            <td className="py-3.5 px-5 font-mono text-stone-600 dark:text-stone-400">
                                                {item.batch_number ? (
                                                    <span className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded text-[11px] font-bold">
                                                        {item.batch_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 italic text-[11px]">-</span>
                                                )}
                                            </td>

                                            {/* Quantity */}
                                            <td className="py-3.5 px-5 text-right font-mono">
                                                <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                                                    {Number(item.quantity).toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-stone-400 text-[10px] ml-1">pcs</span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-5 text-center">
                                                {Number(item.quantity) > 50 ? (
                                                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        Stok Melimpah
                                                    </span>
                                                ) : Number(item.quantity) > 0 ? (
                                                    <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        Tersedia
                                                    </span>
                                                ) : (
                                                    <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                                        Habis
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-stone-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Package className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                                                <p className="text-xs font-medium">
                                                    Tidak ditemukan barang yang sesuai filter pencarian
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── MOVEMENT HISTORY TIMELINE ── */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                        <div>
                            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Log Riwayat Pergerakan Stok di Rak Ini
                            </h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                Catatan aktivitas Inbound Putaway, Transfer, dan Picking terakhir.
                            </p>
                        </div>
                    </div>

                    {movements.length > 0 ? (
                        <div className="space-y-3">
                            {movements.map((log, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3.5 p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 hover:bg-white dark:hover:bg-stone-800/60 transition-all"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            log.to_location_id === location.id
                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                        }`}
                                    >
                                        {log.to_location_id === location.id ? (
                                            <ArrowDownLeft className="w-4 h-4" />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">
                                                {log.reference_no}{' '}
                                                <span className="text-[10px] font-normal text-stone-500 dark:text-stone-400 uppercase bg-stone-200/60 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                                                    {log.type}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                                                {new Date(log.created_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                                            <span className="font-semibold text-blue-700 dark:text-blue-400 font-mono">{log.sku_code}</span> — {log.product_name} ({log.quantity} pcs)
                                        </div>
                                        <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
                                            <User className="w-3 h-3 text-stone-400" />
                                            <span>Operator: {log.operator_name || 'System Admin'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500 italic">
                            Belum ada riwayat pergerakan stok pada lokasi rak ini.
                        </div>
                    )}
                </div>
            </div>

            {/* ── PRINT BARCODE LABEL MODAL ── */}
            {isPrintModalOpen && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-sm shadow-2xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Cetak Label QR & Barcode Rak</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                Label siap ditempel di rak fisik untuk dipindai oleh Mobile Picker.
                            </p>
                        </div>

                        {/* Barcode Mockup */}
                        <div className="p-4 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-950 flex flex-col items-center gap-2">
                            <div className="font-black text-xl font-mono tracking-widest text-stone-900 dark:text-stone-100">
                                {location.rack_code}
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
                                {location.zone || 'General Storage'} · {location.warehouse?.name}
                            </div>
                            <QrCode className="w-24 h-24 text-stone-800 dark:text-stone-200 my-1" />
                            <div className="text-[9px] font-mono text-stone-400 dark:text-stone-500">
                                ID: LOC-{location.id}-{location.warehouse?.code}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsPrintModalOpen(false)}
                                className="flex-1 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.print();
                                    setIsPrintModalOpen(false);
                                }}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDIT LOCATION MODAL ── */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
                            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Edit Detail Lokasi Rak</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                                    Kode / Nama Rak
                                </label>
                                <input
                                    type="text"
                                    value={data.rack_code}
                                    onChange={(e) => setData('rack_code', e.target.value.toUpperCase())}
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                                    Nama Zona
                                </label>
                                <input
                                    type="text"
                                    value={data.zone}
                                    onChange={(e) => setData('zone', e.target.value)}
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-600"
                                    placeholder="Contoh: Zona Fast Moving, Cold Storage"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                                >
                                    {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
