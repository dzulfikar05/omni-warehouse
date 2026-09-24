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
    Warehouse as WarehouseIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { CreateManifestModal } from './components/CreateManifestModal';

interface ManifestItem {
    manifest_code: string;
    status: 'RECEIVING' | 'DRAFT' | 'CLOSED' | 'HOLD';
    supplier_name: string;
    vehicle_no: string;
    vehicle_type: string;
    driver_name: string;
    driver_phone: string;
    warehouse_name: string;
    dock_bay: string;
    total_skus: number;
    total_po_units: number;
    good_units: number;
    damaged_units: number;
    progress_percentage: number;
    created_at: string;
}

interface InboundIndexProps {
    manifests: ManifestItem[];
}

export default function Index({ manifests: initialManifests }: InboundIndexProps) {
    const { current_tenant, auth } = usePage().props as any;
    const [manifests] = useState<ManifestItem[]>(initialManifests || []);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'RECEIVING' | 'DRAFT' | 'CLOSED'>('all');
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
            item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.vehicle_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.driver_name.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && item.status === statusFilter;
    });

    const receivingCount = manifests.filter((m) => m.status === 'RECEIVING').length;
    const draftCount = manifests.filter((m) => m.status === 'DRAFT').length;
    const closedCount = manifests.filter((m) => m.status === 'CLOSED').length;
    const totalPoUnitsAll = manifests.reduce((acc, curr) => acc + curr.total_po_units, 0);

    return (
        <>
            <Head title="Inbound Management (Penerimaan Barang)" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Inbound Management"
                    description="Kelola transaksi penerimaan PO, alokasi unloading dock, dan verifikasi bongkar muat gudang."
                    renderAction={
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="h-9 px-3 bg-muted/60 border border-border rounded-xl flex items-center gap-2 text-xs font-semibold text-foreground">
                                <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{activeTenantName}</span>
                            </div>

                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 rounded-xl shadow-md gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Inisiasi Penerimaan PO</span>
                            </Button>
                        </div>
                    }
                />

                {/* Stat Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Sesi Receiving Aktif
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {receivingCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Manifest</span>
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                Pembongkaran di Loading Dock
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Antrean Waiting Dock
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Truck className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {draftCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Truk</span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                Menunggu penetapan Dock Bay
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Inbound Selesai (Closed)
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {closedCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Dokumen</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                Stok resmi bertambah di DB
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Total Volume PO
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalPoUnitsAll}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Unit</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Alokasi penerimaan gudang
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manifest Table & Filters */}
                <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden text-card-foreground">
                    {/* Filter & Search Bar */}
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari Kode PO, Supplier, No. Polisi Armada, atau Supir..."
                                className="pl-9 h-9 text-xs border-border bg-background rounded-xl"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
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
                                onClick={() => setStatusFilter('RECEIVING')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'RECEIVING'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Receiving ({receivingCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('DRAFT')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'DRAFT'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Draft ({draftCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('CLOSED')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'CLOSED'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Selesai ({closedCount})
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Kode Manifest PO</th>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Supplier &amp; Gudang</th>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Armada &amp; Supir</th>
                                    <th className="py-3.5 px-5 whitespace-nowrap">Dock Assigned</th>
                                    <th className="py-3.5 px-5 text-right whitespace-nowrap">Progress Fisik</th>
                                    <th className="py-3.5 px-5 text-center whitespace-nowrap">Status Manifest</th>
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
                                                    {item.created_at}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span>{item.supplier_name}</span>
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
                                                    Sopir: {item.driver_name} ({item.driver_phone})
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className="px-2.5 py-1 bg-muted/60 border border-border rounded-xl font-mono font-bold text-foreground">
                                                    {item.dock_bay}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right font-mono">
                                                <div className="font-bold text-foreground">
                                                    {item.good_units + item.damaged_units} / {item.total_po_units} Unit
                                                </div>
                                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {item.progress_percentage}% Tervalidasi
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-mono border ${
                                                        item.status === 'RECEIVING'
                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                            : item.status === 'CLOSED'
                                                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            item.status === 'RECEIVING'
                                                                ? 'bg-amber-500 animate-pulse'
                                                                : item.status === 'CLOSED'
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
                                                    <Link href={`/${tenantSlug}/transactions/inbound/${item.manifest_code}`}>
                                                        <span>{item.status === 'CLOSED' ? 'Lihat Details' : 'Kelola Bongkar'}</span>
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
                                                    Belum Ada Manifest Inbound
                                                </p>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Belum ada transaksi penerimaan terdaftar di database gudang ini. Klik tombol <strong className="text-foreground font-semibold">"+ Inisiasi Penerimaan PO"</strong> di atas untuk membuat sesi baru.
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

            <CreateManifestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Transaction', href: '#' },
        { title: 'Inbound Management (Daftar Manifest)', href: '#' },
    ],
};
