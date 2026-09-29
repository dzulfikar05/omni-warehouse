import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRightLeft,
    CheckCircle2,
    Clock,
    Layers,
    PackageCheck,
    Plus,
    Search,
    Warehouse as WarehouseIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { usePermission } from '@/utils/permission';
import type { LocationOption, SkuOption, StockTransferItem, StockTransferSummary, WarehouseOption } from '@/types/stock_transfer';
import { CreateTransferModal } from './components/CreateTransferModal';

interface StockTransferIndexProps {
    tenant_slug: string;
    transfers?: StockTransferItem[];
    warehouses?: WarehouseOption[];
    locations?: LocationOption[];
    skus?: SkuOption[];
    summary?: StockTransferSummary;
}

export default function StockTransferIndex({
    transfers: initialTransfers = [],
    warehouses = [],
    locations = [],
    skus = [],
    summary: initialSummary,
}: StockTransferIndexProps) {
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();
    const [transfers] = useState<StockTransferItem[]>(initialTransfers);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_TRANSIT'>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'demo-tenant';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const activeTenantName =
        current_tenant?.name ||
        auth?.user?.tenant_name ||
        auth?.user?.tenant?.name ||
        'Tenant Portal';

    const filteredTransfers = transfers.filter((item) => {
        const matchesSearch =
            item.transfer_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.from_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.to_location.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'ALL') return matchesSearch;
        return matchesSearch && item.status === statusFilter;
    });

    const totalTransfers = transfers.length;
    const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT').length;
    const completedCount = transfers.filter((t) => t.status === 'COMPLETED').length;
    const totalUnitsMoved = transfers.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <>
            <Head title="Stock Transfer Management (Pemindahan Barang)" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Stock Transfer Management"
                    description="Kelola relokasi stok internal, replenishment rak penyimpanan, dan mutasi barang antar lokasi gudang."
                    renderAction={
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="h-9 px-3 bg-muted/60 border border-border rounded-xl flex items-center gap-2 text-xs font-semibold text-foreground">
                                <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{activeTenantName}</span>
                            </div>

                            {can('tenant.stock_transfer.create') && (
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 rounded-xl shadow-md gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Buat Transfer Stok</span>
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
                                Total Transfer Sesi
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalTransfers}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Mutasi</span>
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                Sesi relokasi stok terdaftar
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Dalam Perjalanan (In Transit)
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {inTransitCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Proses</span>
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                                Sedang dipindahkan antar rak
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Selesai (Completed)
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {completedCount}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Selesai</span>
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                Stok aman di lokasi tujuan
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between h-32 text-card-foreground">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Total Unit Dipindahkan
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <PackageCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-foreground tracking-tight">
                                {totalUnitsMoved}{' '}
                                <span className="text-xs font-normal text-muted-foreground">Pcs</span>
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                                Akumulasi unit terelokasi
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
                                placeholder="Cari Kode Transfer, SKU, Lokasi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-muted/50 border-input text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'ALL'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Semua ({transfers.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('IN_TRANSIT')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'IN_TRANSIT'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                In Transit ({inTransitCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('COMPLETED')}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    statusFilter === 'COMPLETED'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Completed ({completedCount})
                            </button>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                                    <th className="py-3.5 px-5">Kode Transfer</th>
                                    <th className="py-3.5 px-5">Produk / SKU</th>
                                    <th className="py-3.5 px-5">Lokasi Asal (Origin)</th>
                                    <th className="py-3.5 px-5">Lokasi Tujuan (Dest)</th>
                                    <th className="py-3.5 px-5 text-center">Qty</th>
                                    <th className="py-3.5 px-5">Status</th>
                                    <th className="py-3.5 px-5">Operator</th>
                                    <th className="py-3.5 px-5 text-right">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredTransfers.length > 0 ? (
                                    filteredTransfers.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-5 font-mono font-semibold text-primary">
                                                {item.transfer_code}
                                            </td>
                                            <td className="py-4 px-5">
                                                <div>
                                                    <p className="font-semibold text-foreground text-xs">{item.product_name}</p>
                                                    <p className="text-[11px] text-muted-foreground font-mono">{item.sku_code}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        {item.from_location}
                                                    </span>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.from_warehouse}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                        {item.to_location}
                                                    </span>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.to_warehouse}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-center font-bold text-foreground text-sm">
                                                {item.quantity}
                                            </td>
                                            <td className="py-4 px-5">
                                                {item.status === 'COMPLETED' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        In Transit
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-5 text-muted-foreground font-medium">{item.created_by}</td>
                                            <td className="py-4 px-5 text-right text-muted-foreground font-mono text-[11px]">
                                                {item.created_at}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-muted-foreground">
                                            Tidak ada transaksi transfer stok yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create */}
            <CreateTransferModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                tenantSlug={tenantSlug}
                warehouses={warehouses}
                locations={locations}
                skus={skus}
            />
        </>
    );
}
