import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Warehouse as WarehouseIcon,
    Plus,
    Search,
    Edit3,
    Trash2,
    Building2,
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
            <Head title="Warehouse Management" />

            <div className="space-y-6 p-4">
                {/* HERO BANNER CARD */}
                <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-md">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Warehouse Management
                                </h1>
                                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Active Tenant
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Kelola data master gudang, titik lokasi, dan kapasitas penyimpanan fisik.
                            </p>
                        </div>

                        {/* Top Action Bar */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button onClick={openCreateModal} className="shadow-md">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Add Warehouse</span>
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama gudang atau kode (cth: WH-JKT01)..."
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                            <span>Cari Gudang</span>
                        </Button>
                    </form>
                </div>

                {/* 4 METRIC CARDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-md flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Total Warehouses</span>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <WarehouseIcon className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {totalWarehouses} <span className="text-xs font-normal text-muted-foreground">Unit</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                ● {activeWarehouses} Aktif Beroperasi
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-md flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Racks & Zones</span>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                148 <span className="text-xs font-normal text-muted-foreground">Racks</span>
                            </div>
                            <div className="text-xs text-primary font-medium mt-1">
                                12 Designated Zones (96% Mapped)
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-md flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Live Stock Count</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                84,290 <span className="text-xs font-normal text-muted-foreground">Items</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                ↑ +3.8% dari bulan lalu
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-md flex flex-col justify-between h-36">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Storage Utilization</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                78.4%
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: '78.4%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WAREHOUSE LEDGER TABLE */}
                <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-md flex flex-col">
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-foreground">Daftar Gudang Tenant</h2>
                            <p className="text-xs text-muted-foreground">Menampilkan seluruh fasilitas gudang terdaftar dalam sistem</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg text-xs font-mono text-muted-foreground">
                            <span className="font-semibold text-foreground">{warehouses.data.length} Gudang Tersedia</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                    <th className="p-4 font-semibold">Kode Gudang</th>
                                    <th className="p-4 font-semibold">Nama Warehouse</th>
                                    <th className="p-4 font-semibold">Alamat / Deskripsi</th>
                                    <th className="p-4 font-semibold">Tanggal Ditambahkan</th>
                                    <th className="p-4 text-center font-semibold">Status</th>
                                    <th className="p-4 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {warehouses.data.length > 0 ? (
                                    warehouses.data.map((wh) => (
                                        <tr key={wh.id} className="transition-colors hover:bg-muted/50">
                                            <td className="p-4 font-mono font-bold text-primary">
                                                {wh.code}
                                            </td>
                                            <td className="p-4 font-semibold text-foreground">
                                                {wh.name}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {wh.desc || '-'}
                                            </td>
                                            <td className="p-4 font-mono text-muted-foreground">
                                                {new Date(wh.created_at).toISOString().split('T')[0]}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${wh.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                                    {wh.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(wh)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Edit Gudang"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(wh.id, wh.name)}
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    title="Hapus Gudang"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <WarehouseIcon className="w-8 h-8 text-muted-foreground/50 stroke-1" />
                                                <p className="text-xs font-semibold text-foreground">
                                                    Belum ada data gudang yang terdaftar untuk tenant ini.
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    Klik tombol <strong className="text-primary font-semibold">"Add Warehouse"</strong> di atas untuk menambahkan gudang baru.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between border-t border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                        <div>
                            Page <span className="font-medium text-foreground">{warehouses.current_page}</span> of {warehouses.last_page || 1}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!warehouses.prev_page_url}
                                onClick={() => warehouses.prev_page_url && router.visit(warehouses.prev_page_url)}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!warehouses.next_page_url}
                                onClick={() => warehouses.next_page_url && router.visit(warehouses.next_page_url)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CREATE / EDIT WAREHOUSE */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl border border-border text-card-foreground">
                        <h2 className="text-base font-bold text-foreground mb-4">
                            {editMode ? 'Edit Data Gudang' : 'Tambah Gudang Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Kode Gudang</label>
                                <Input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="Contoh: WH-JKT01"
                                    className="font-mono"
                                />
                                {errors.code && <p className="text-destructive text-[11px] mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Nama Warehouse</label>
                                <Input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Gudang Utama JKT"
                                />
                                {errors.name && <p className="text-destructive text-[11px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">Alamat / Deskripsi</label>
                                <Input
                                    type="text"
                                    value={data.desc}
                                    onChange={(e) => setData('desc', e.target.value)}
                                    placeholder="Contoh: Jl. Raya Cakung No. 12"
                                />
                                {errors.desc && <p className="text-destructive text-[11px] mt-1">{errors.desc}</p>}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-border bg-background text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-foreground cursor-pointer">Status Aktif Beroperasi</label>
                            </div>

                            <div className="flex justify-end gap-2.5 mt-6 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit">
                                    {editMode ? 'Simpan Perubahan' : 'Simpan Gudang'}
                                </Button>
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
