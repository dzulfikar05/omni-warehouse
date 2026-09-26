import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    FileText,
    Plus,
    Search,
    Truck,
    Users,
    Warehouse as WarehouseIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { usePermission } from '@/utils/permission';
import type { OutboundManifest } from '@/types/outbound';
import { CreateShippingModal } from './components/CreateShippingModal';

interface OutboundIndexProps {
    manifests: OutboundManifest[];
}

export default function Index({ manifests: initialManifests }: OutboundIndexProps) {
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();
    const [manifests] = useState<OutboundManifest[]>(initialManifests || []);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'READY_TO_PICK' | 'PACKING' | 'DISPATCHED'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const activeTenantName =
        current_tenant?.name ||
        auth?.user?.tenant_name ||
        auth?.user?.tenant?.name ||
        'Tenant Portal';

    const filteredManifests = manifests.filter((item) => {
        const matchesSearch =
            item.manifest_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.so_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.driver_name.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && item.status === statusFilter;
    });

    const readyCount = manifests.filter((m) => m.status === 'READY_TO_PICK').length;
    const packingCount = manifests.filter((m) => m.status === 'PACKING').length;
    const dispatchedCount = manifests.filter((m) => m.status === 'DISPATCHED').length;

    return (
        <>
            <Head title="Outbound Management (Pengiriman Barang)" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Outbound Management"
                    description="Kelola transaksi pengiriman barang (SO/Surat Jalan), zone picking rak, verifikasi packing, dan penyerahan armada."
                    renderAction={
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="h-9 px-3 bg-muted/60 border border-border rounded-xl flex items-center gap-2 text-xs font-semibold text-foreground">
                                <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{activeTenantName}</span>
                            </div>

                            {can('outbound.create') && (
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 rounded-xl shadow-md gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Inisiasi Outbound SO</span>
                                </Button>
                            )}
                        </div>
                    }
                />

                {/* Stat Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Ready to Pick
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {readyCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">SO Order</span>
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                Siap di-ambil dari Rak
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Proses Packing Area
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Truck className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {packingCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Paket</span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                Verifikasi Scanner &amp; Kardus
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Dispatched (Surat Jalan)
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {dispatchedCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Armada</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                Berangkat &amp; Stok Terpotong
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Shipping Dock Status
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                Live{' '}
                                <span className="text-xs font-normal text-muted-foreground">Active</span>
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                                Gate Dock Outbound Ops
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Filter & Table Card */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden text-card-foreground">
                    <div className="p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                type="text"
                                placeholder="Cari Kode SO, Customer, No. Polisi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-muted/50 border-input text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Semua ({manifests.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('READY_TO_PICK')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'READY_TO_PICK'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Picking ({readyCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('PACKING')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'PACKING'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Packing ({packingCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('DISPATCHED')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'DISPATCHED'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Terkirim ({dispatchedCount})
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Kode Shipping SO</th>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Customer &amp; Gudang</th>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Armada &amp; Supir</th>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Shipping Dock</th>
                                    <th className="py-3.5 px-5 text-right whitespace-nowrap">Progress Packing</th>
                                    <th className="py-3.5 px-5 text-center whitespace-nowrap">Status Outbound</th>
                                    <th className="py-3.5 px-5 text-center whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {filteredManifests.length > 0 ? (
                                    filteredManifests.map((item) => (
                                        <tr key={item.manifest_code} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-5">
                                                <div className="font-bold font-mono text-blue-600 dark:text-blue-400 text-xs">
                                                    {item.manifest_code}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground font-mono">
                                                    {item.created_at || 'Hari ini'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{item.customer_name}</span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    Gudang: {item.warehouse_name}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                                                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{item.vehicle_no}</span>
                                                    <span className="text-muted-foreground font-normal font-sans">({item.vehicle_type})</span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    Kurir: {item.driver_name} ({item.driver_phone})
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="px-2.5 py-1 bg-muted/60 border border-border rounded-xl font-mono font-bold text-foreground">
                                                    {item.dock_bay}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right font-mono">
                                                <div className="font-bold text-foreground">
                                                    {item.packed_units} / {item.total_so_units} Unit
                                                </div>
                                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {item.progress_percentage}% Verifikasi
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-mono border ${
                                                        item.status === 'PACKING'
                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                            : item.status === 'DISPATCHED'
                                                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            item.status === 'PACKING'
                                                                ? 'bg-amber-500 animate-pulse'
                                                                : item.status === 'DISPATCHED'
                                                                  ? 'bg-emerald-500'
                                                                  : 'bg-blue-500'
                                                        }`}
                                                    />
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <Button
                                                    asChild
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-8 px-3 rounded-xl shadow-sm gap-1.5"
                                                >
                                                    <Link href={`/${tenantSlug}/transactions/outbound/${item.manifest_code}`}>
                                                        <span>{item.status === 'DISPATCHED' ? 'Lihat Details' : 'Kelola Outbound'}</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                                <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-1">
                                                    <FileText className="w-6 h-6 stroke-1.5" />
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    Belum Ada Manifest Outbound
                                                </p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Belum ada pengiriman barang terdaftar di database gudang ini. Klik tombol <strong className="text-foreground font-semibold">"+ Inisiasi Outbound SO"</strong> di atas untuk membuat sesi pengiriman baru.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreateShippingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Transaction', href: '#' },
        { title: 'Outbound Management (Daftar Pengiriman)', href: '#' },
    ],
};
