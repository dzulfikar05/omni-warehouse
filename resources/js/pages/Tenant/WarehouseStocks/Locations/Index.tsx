import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { ActionButton } from '@/components/action-button';
import { toast } from 'sonner';
import {
    Layers,
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    X,
    MapPin,
    Package,
    Warehouse as WarehouseIcon,
    Grid3x3,
    ChevronDown,
    Hash,
    Loader2,
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
    total_sku_count: number;
    total_qty: number;
    created_at: string;
}

interface Props {
    locations: {
        data: Location[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    warehouses: Warehouse[];
    filters: { search?: string; warehouse_id?: string };
}

// ─── Zone Badge Colors ────────────────────────────────────────────────────────

const ZONE_COLORS: Record<string, string> = {
    default:      'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    'fast-moving':'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'cold':       'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'hazardous':  'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'display':    'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'bulk':       'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

function getZoneColor(zone: string | null): string {
    if (!zone) return ZONE_COLORS.default;
    const key = Object.keys(ZONE_COLORS).find((k) =>
        zone.toLowerCase().includes(k)
    );
    return key ? ZONE_COLORS[key] : ZONE_COLORS.default;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LocationsIndex({ locations, warehouses, filters }: Props) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug  = window.location.pathname.split('/')[1];
    const tenantSlug       = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const [search, setSearch]                 = useState(filters.search || '');
    const [warehouseFilter, setWarehouseFilter] = useState(filters.warehouse_id || '');
    const [isSearching, setIsSearching]         = useState(false);
    const [isModalOpen, setIsModalOpen]        = useState(false);
    const [editMode, setEditMode]              = useState(false);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        id:           '',
        warehouse_id: '',
        rack_code:    '',
        zone:         '',
    });

    // ── Live Realtime Debounced Search & Filter ───────────────────────────────

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                `/${tenantSlug}/locations`,
                { search, warehouse_id: warehouseFilter },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, warehouseFilter, tenantSlug]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (loc: Location) => {
        setData({
            id:           String(loc.id),
            warehouse_id: String(loc.warehouse_id),
            rack_code:    loc.rack_code,
            zone:         loc.zone || '',
        });
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
            put(`/${tenantSlug}/locations/${data.id}`, {
                onSuccess: () => { setIsModalOpen(false); toast.success('Lokasi rak berhasil diperbarui!'); },
            });
        } else {
            post(`/${tenantSlug}/locations`, {
                onSuccess: () => { setIsModalOpen(false); toast.success('Lokasi rak baru berhasil ditambahkan!'); },
            });
        }
    };

    const handleDelete = (id: number, code: string) => {
        if (!confirm(`Hapus rak "${code}"? Data stok di rak ini akan terlepas dari lokasi ini.`)) return;
        destroy(`/${tenantSlug}/locations/${id}`, {
            onSuccess: () => toast.success('Lokasi rak berhasil dihapus!'),
        });
    };

    // ── Derived Stats ─────────────────────────────────────────────────────────

    const totalLocations = locations.total;
    const totalZones     = [...new Set(locations.data.map((l) => l.zone).filter(Boolean))].length;
    const totalQty       = locations.data.reduce((s, l) => s + Number(l.total_qty || 0), 0);
    const occupiedRacks  = locations.data.filter((l) => Number(l.total_sku_count) > 0).length;

    return (
        <>
            <Head title="Rack & Stock Location - Warehouse & Stocks" />

            <div className="p-6 flex flex-col gap-6 font-sans text-stone-900 dark:text-stone-100 bg-[#FAFAF9] dark:bg-stone-950 min-h-screen">

                {/* HERO BANNER CARD */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                    Rack & Stock Location
                                </h1>
                                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    Location Mapping
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                Kelola pemetaan zona & titik penyimpanan fisik barang (rak, etalase, slot) di seluruh gudang tenant.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Lokasi Rak</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Row with Realtime Auto-Search */}
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari langsung real-time kode rak atau zona (cth: RACK-A01, Fast Moving)..."
                                className="w-full pl-10 pr-9 py-2.5 bg-stone-50 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-blue-600 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-xs font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none transition-all"
                            />
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                            ) : search ? (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 rounded-full cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            ) : null}
                        </div>

                        {/* Warehouse Filter Dropdown */}
                        <div className="relative w-full sm:w-60">
                            <select
                                value={warehouseFilter}
                                onChange={(e) => setWarehouseFilter(e.target.value)}
                                className="w-full h-10 pl-3.5 pr-8 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 outline-none cursor-pointer appearance-none transition-all"
                            >
                                <option value="">Semua Gudang</option>
                                {warehouses.map((wh) => (
                                    <option key={wh.id} value={String(wh.id)}>
                                        {wh.code} — {wh.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* 4 METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Lokasi Rak</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                {totalLocations} <span className="text-xs font-normal text-stone-500 dark:text-stone-400">Rak</span>
                            </div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                                ● {occupiedRacks} Rak Terisi Stok
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Zona Aktif</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Grid3x3 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                {totalZones} <span className="text-xs font-normal text-stone-500 dark:text-stone-400">Zona</span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                Di {warehouses.length} gudang terdaftar
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Barang Tersimpan</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                {totalQty.toLocaleString('id-ID')} <span className="text-xs font-normal text-stone-500 dark:text-stone-400">Pcs</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                Dari {locations.data.reduce((s, l) => s + Number(l.total_sku_count || 0), 0)} SKU aktif
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Utilitas Lokasi</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <MapPin className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                                {totalLocations > 0
                                    ? Math.round((occupiedRacks / totalLocations) * 100)
                                    : 0}%
                            </div>
                            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${totalLocations > 0 ? Math.round((occupiedRacks / totalLocations) * 100) : 0}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN DATA TABLE */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">Daftar Lokasi & Rak Penyimpanan</h2>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                Klik tombol mata untuk membuka halaman detail & visualisasi matriks rak interaktif
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs font-mono">
                            <span className="px-2 py-0.5 font-semibold text-stone-700 dark:text-stone-300">
                                {totalLocations} Lokasi Terdaftar
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-stone-50 dark:bg-stone-950/50 text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="py-3.5 px-5">Kode Rak</th>
                                    <th className="py-3.5 px-5">Zona</th>
                                    <th className="py-3.5 px-5">Gudang</th>
                                    <th className="py-3.5 px-5 text-center">Total SKU</th>
                                    <th className="py-3.5 px-5 text-center">Total Qty</th>
                                    <th className="py-3.5 px-5">Dibuat</th>
                                    <th className="py-3.5 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-800 dark:text-stone-200">
                                {locations.data.length > 0 ? (
                                    locations.data.map((loc) => (
                                        <tr
                                            key={loc.id}
                                            className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors group"
                                        >
                                            {/* Rack Code */}
                                            <td className="py-3 px-5">
                                                <Link
                                                    href={`/${tenantSlug}/locations/${loc.id}`}
                                                    className="flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shrink-0">
                                                        <Hash className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="font-mono font-bold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                        {loc.rack_code}
                                                    </div>
                                                </Link>
                                            </td>

                                            {/* Zone Badge */}
                                            <td className="py-3 px-5">
                                                {loc.zone ? (
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getZoneColor(loc.zone)}`}
                                                    >
                                                        {loc.zone}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 italic text-[11px]">
                                                        General Storage
                                                    </span>
                                                )}
                                            </td>

                                            {/* Warehouse */}
                                            <td className="py-3 px-5">
                                                <div className="flex items-center gap-1.5">
                                                    <WarehouseIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                                        {loc.warehouse?.name || '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* SKU Count */}
                                            <td className="py-3 px-5 text-center">
                                                <span
                                                    className={`font-mono font-bold text-sm ${Number(loc.total_sku_count) > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-stone-400'}`}
                                                >
                                                    {Number(loc.total_sku_count || 0)}
                                                </span>
                                                <span className="text-stone-400 text-[11px] ml-1">SKU</span>
                                            </td>

                                            {/* Total Qty */}
                                            <td className="py-3 px-5 text-center">
                                                <span
                                                    className={`font-mono font-bold text-sm ${Number(loc.total_qty) > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}`}
                                                >
                                                    {Number(loc.total_qty || 0).toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-stone-400 text-[11px] ml-1">pcs</span>
                                            </td>

                                            {/* Created */}
                                            <td className="py-3 px-5 font-mono text-stone-500 dark:text-stone-400 text-[11px]">
                                                {new Date(loc.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <ActionButton
                                                        label={loc.rack_code}
                                                        showUrl={`/${tenantSlug}/locations/${loc.id}`}
                                                        onEdit={() => openEditModal(loc)}
                                                        onDelete={() => handleDelete(loc.id, loc.rack_code)}
                                                        canShow={true}
                                                        canEdit={true}
                                                        canDelete={true}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Layers className="w-10 h-10 text-stone-200 dark:text-stone-700 stroke-1" />
                                                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                                                    Belum ada lokasi rak yang terdaftar
                                                </p>
                                                <p className="text-[11px] text-stone-400">
                                                    Klik{' '}
                                                    <strong className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        "Tambah Lokasi Rak"
                                                    </strong>{' '}
                                                    untuk mulai mendaftarkan titik penyimpanan di gudang Anda.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}
                                                    className="mt-1 h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Tambah Lokasi Rak Pertama
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 bg-stone-50 dark:bg-stone-950/50 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
                        <div>
                            Page {locations.current_page} of {locations.last_page || 1} —{' '}
                            {totalLocations} lokasi terdaftar
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={!locations.prev_page_url}
                                onClick={() => locations.prev_page_url && router.visit(locations.prev_page_url)}
                                className="px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 transition text-xs font-medium cursor-pointer"
                            >
                                &lt; Prev
                            </button>
                            <button
                                disabled={!locations.next_page_url}
                                onClick={() => locations.next_page_url && router.visit(locations.next_page_url)}
                                className="px-3 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 transition text-xs font-medium cursor-pointer"
                            >
                                Next &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center">
                                    <Layers className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                        {editMode ? 'Edit Lokasi Rak' : 'Tambah Lokasi Rak Baru'}
                                    </h2>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        {editMode
                                            ? 'Perbarui detail zona dan kode rak penyimpanan'
                                            : 'Daftarkan titik simpan baru di gudang aktif'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Warehouse Select */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                                    Gudang Target <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.warehouse_id}
                                        onChange={(e) => setData('warehouse_id', e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 appearance-none pr-8 cursor-pointer"
                                    >
                                        <option value="">-- Pilih Gudang --</option>
                                        {warehouses.map((wh) => (
                                            <option key={wh.id} value={String(wh.id)}>
                                                {wh.code} — {wh.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {errors.warehouse_id && (
                                    <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">{errors.warehouse_id}</p>
                                )}
                            </div>

                            {/* Rack Code */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                                    Kode / Nama Rak <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.rack_code}
                                    onChange={(e) => setData('rack_code', e.target.value.toUpperCase())}
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-blue-600 uppercase"
                                    placeholder="Contoh: RACK-A01, ETALASE-DEPAN, KULKAS-01"
                                />
                                <p className="text-[10px] text-stone-400 mt-1">
                                    Gunakan format singkat yang mudah dibaca oleh Mobile Picker.
                                </p>
                                {errors.rack_code && (
                                    <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">{errors.rack_code}</p>
                                )}
                            </div>

                            {/* Zone */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 mb-1.5">
                                    Zona / Kategori Area
                                </label>
                                <input
                                    type="text"
                                    value={data.zone}
                                    onChange={(e) => setData('zone', e.target.value)}
                                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-blue-600"
                                    placeholder="Contoh: Zona Fast Moving, Cold Storage, Bulk Area"
                                />
                                {errors.zone && (
                                    <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1">{errors.zone}</p>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                                >
                                    {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{editMode ? 'Simpan Perubahan' : 'Tambah Rak'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
