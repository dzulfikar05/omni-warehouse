import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Warehouse as WarehouseIcon,
    Plus,
    Search,
    Edit3,
    Trash2,
    Building2,
    MapPin,
    Layers,
    Activity,
} from 'lucide-react';

interface Warehouse {
    id: number;
    code: string;
    name: string;
    desc: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    warehouses: {
        data: Warehouse[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search?: string;
    };
}

export default function WarehouseIndex({ warehouses, filters }: Props) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        id: '',
        name: '',
        code: '',
        desc: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(`/${tenantSlug}/warehouses`, { search }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        setEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (warehouse: Warehouse) => {
        setData({
            id: String(warehouse.id),
            name: warehouse.name,
            code: warehouse.code,
            desc: warehouse.desc || '',
            is_active: warehouse.is_active,
        });
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
            put(`/${tenantSlug}/warehouses/${data.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Data gudang berhasil diperbarui!');
                },
            });
        } else {
            post(`/${tenantSlug}/warehouses`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Gudang baru berhasil ditambahkan!');
                },
            });
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus gudang "${name}"?`)) {
            destroy(`/${tenantSlug}/warehouses/${id}`, {
                onSuccess: () => toast.success('Gudang berhasil dihapus!'),
            });
        }
    };

    const totalWarehouses = warehouses.data.length;
    const activeWarehouses = warehouses.data.filter((w) => w.is_active).length;

    return (
        <>
            <Head title="Warehouse & Stocks (Warehouse)" />

            <div className="p-6 flex flex-col gap-6 font-sans text-stone-900 bg-[#FAFAF9] min-h-screen">
                {/* HERO BANNER CARD */}
                <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                                    Warehouse Management
                                </h1>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    Active Tenant
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                                Kelola data master gudang, titik lokasi, dan kapasitas penyimpanan fisik.
                            </p>
                        </div>

                        {/* Top Action Bar */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Warehouse</span>
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3">                        <div className="relative flex-1 w-full">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                                <Search className="w-4 h-4 text-stone-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama gudang atau kode (cth: WH-JKT01)..."
                                className="w-full pl-9 pr-4 py-2 bg-stone-50 hover:bg-white border border-stone-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/10 rounded-lg text-xs font-medium text-stone-900 placeholder-stone-400 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto h-9 px-4 bg-stone-800 hover:bg-stone-900 active:scale-[0.98] text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs flex-shrink-0 cursor-pointer"
                        >
                            <span>Cari Gudang</span>
                        </button>
                    </form>
                </div>

                {/* 4 METRIC CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Total Warehouses</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <WarehouseIcon className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 tracking-tight">
                                {totalWarehouses} <span className="text-xs font-normal text-stone-500">Unit</span>
                            </div>
                            <div className="text-xs text-emerald-600 font-medium mt-1">
                                ● {activeWarehouses} Aktif Beroperasi
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Racks & Zones</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 tracking-tight">
                                148 <span className="text-xs font-normal text-stone-500">Racks</span>
                            </div>
                            <div className="text-xs text-indigo-600 font-medium mt-1">
                                12 Designated Zones (96% Mapped)
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Live Stock Count</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 tracking-tight">
                                84,290 <span className="text-xs font-normal text-stone-500">Items</span>
                            </div>
                            <div className="text-xs text-emerald-600 font-medium mt-1">
                                ↑ +3.8% dari bulan lalu
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-500">Storage Utilization</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-stone-900 tracking-tight">
                                78.4%
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '78.4%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WAREHOUSE LEDGER TABLE */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-stone-900">Daftar Gudang Tenant</h2>
                            <p className="text-xs text-stone-500">Menampilkan seluruh fasilitas gudang terdaftar dalam sistem</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs font-mono">
                            <span className="px-2 py-0.5 font-semibold text-stone-700">{warehouses.data.length} Gudang Tersedia</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                                <tr>
                                    <th className="py-3 px-5">Kode Gudang</th>
                                    <th className="py-3 px-5">Nama Warehouse</th>
                                    <th className="py-3 px-5">Alamat / Deskripsi</th>
                                    <th className="py-3 px-5">Tanggal Ditambahkan</th>
                                    <th className="py-3 px-5 text-center">Status</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-800 font-sans">
                                {warehouses.data.length > 0 ? (
                                    warehouses.data.map((wh) => (
                                        <tr key={wh.id} className="hover:bg-stone-50/70 transition-colors">
                                            <td className="py-3 px-5 font-mono">
                                                <div className="font-bold text-blue-600">{wh.code}</div>
                                            </td>
                                            <td className="py-3 px-5 font-semibold text-stone-900">
                                                {wh.name}
                                            </td>
                                            <td className="py-3 px-5 text-stone-600">
                                                {wh.desc || '-'}
                                            </td>
                                            <td className="py-3 px-5 font-mono text-stone-500">
                                                {new Date(wh.created_at).toISOString().split('T')[0]}
                                            </td>
                                            <td className="py-3 px-5 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${wh.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                    {wh.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(wh)}
                                                    className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                                                    title="Edit Gudang"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(wh.id, wh.name)}
                                                    className="p-1 hover:bg-rose-50 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                    title="Hapus Gudang"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-stone-400 font-sans">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <WarehouseIcon className="w-8 h-8 text-stone-300 stroke-1" />
                                                <p className="text-xs font-semibold text-stone-700">
                                                    Belum ada data gudang yang terdaftar untuk tenant ini.
                                                </p>
                                                <p className="text-[11px] text-stone-400">
                                                    Klik tombol <strong className="text-blue-600 font-semibold">"Add Warehouse"</strong> di atas untuk menambahkan gudang baru.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
                        <div>
                            Page {warehouses.current_page} of {warehouses.last_page || 1}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={!warehouses.prev_page_url}
                                onClick={() => warehouses.prev_page_url && router.visit(warehouses.prev_page_url)}
                                className="px-3 py-1 bg-white border border-stone-200 rounded-md disabled:opacity-40 hover:bg-stone-100 transition text-xs font-medium cursor-pointer"
                            >
                                &lt; Prev
                            </button>
                            <button
                                disabled={!warehouses.next_page_url}
                                onClick={() => warehouses.next_page_url && router.visit(warehouses.next_page_url)}
                                className="px-3 py-1 bg-white border border-stone-200 rounded-md disabled:opacity-40 hover:bg-stone-100 transition text-xs font-medium cursor-pointer"
                            >
                                Next &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CREATE / EDIT WAREHOUSE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-stone-200">
                        <h2 className="text-base font-bold text-stone-900 mb-4">
                            {editMode ? 'Edit Data Gudang' : 'Tambah Gudang Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Kode Gudang</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                                    placeholder="Contoh: WH-JKT01"
                                />
                                {errors.code && <p className="text-rose-600 text-[11px] mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Nama Warehouse</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                                    placeholder="Contoh: Gudang Utama JKT"
                                />
                                {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-stone-500 mb-1">Alamat / Deskripsi</label>
                                <input
                                    type="text"
                                    value={data.desc}
                                    onChange={(e) => setData('desc', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-600 focus:bg-white"
                                    placeholder="Contoh: Jl. Raya Cakung No. 12"
                                />
                                {errors.desc && <p className="text-rose-600 text-[11px] mt-1">{errors.desc}</p>}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-stone-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-stone-700 cursor-pointer">Status Aktif Beroperasi</label>
                            </div>

                            <div className="flex justify-end gap-2.5 mt-6 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                                >
                                    {editMode ? 'Simpan Perubahan' : 'Simpan Gudang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

WarehouseIndex.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Warehouses', href: '#' },
    ],
};