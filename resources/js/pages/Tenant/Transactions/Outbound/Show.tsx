import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CheckSquare,
    Clock,
    Database,
    FileCheck2,
    FileText,
    PackageCheck,
    PauseCircle,
    QrCode,
    RefreshCw,
    Search,
    ShieldAlert,
    Truck,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import type { OutboundItem, OutboundManifest } from '@/types/outbound';
import { DispatchCommitModal } from './components/DispatchCommitModal';
import { HoldShippingModal } from './components/HoldShippingModal';
import { PackingDrawer } from './components/PackingDrawer';
import { SuratJalanPreviewModal } from './components/SuratJalanPreviewModal';

interface OutboundShowProps {
    manifest: OutboundManifest;
    items: OutboundItem[];
}

export default function Show({ manifest: initialManifest, items: initialItems }: OutboundShowProps) {
    const { current_tenant, auth } = usePage().props as any;
    const [manifest, setManifest] = useState<OutboundManifest>(initialManifest);
    const [items, setItems] = useState<OutboundItem[]>(initialItems || []);
    const [barcodeInput, setBarcodeInput] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'picking' | 'packed' | 'issue'>('all');

    // Modals & Drawer state
    const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<OutboundItem | null>(null);
    const [isCommitModalOpen, setIsCommitModalOpen] = useState<boolean>(false);
    const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);
    const [isSuratJalanOpen, setIsSuratJalanOpen] = useState<boolean>(false);

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    // Filter Items
    const filteredItems = items.filter((item) => {
        if (filterStatus === 'all') return true;
        return item.status === filterStatus;
    });

    // Handle Barcode Scan Submit
    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!barcodeInput.trim()) return;

        const foundIndex = items.findIndex(
            (i) => i.barcode === barcodeInput.trim() || i.sku === barcodeInput.trim(),
        );

        if (foundIndex !== -1) {
            const itemToUpdate = items[foundIndex];
            const updatedItems = [...items];
            const newPacked = itemToUpdate.packed_qty + 1;
            const isFullPacked = newPacked >= itemToUpdate.so_qty;

            updatedItems[foundIndex] = {
                ...itemToUpdate,
                picked_qty: Math.max(itemToUpdate.picked_qty, newPacked),
                packed_qty: newPacked,
                status: isFullPacked ? 'packed' : 'picking',
                status_label: isFullPacked ? 'Terverifikasi Packed' : `Picking (${newPacked}/${itemToUpdate.so_qty})`,
            };

            setItems(updatedItems);
            toast.success(`1 Unit ${itemToUpdate.sku} tervalidasi di meja packing!`);
        } else {
            toast.error(`Barcode / SKU ${barcodeInput} tidak ditemukan di manifest pengiriman ini!`);
        }

        setBarcodeInput('');
    };

    // Save from Packing Drawer
    const handleSaveDrawer = (pickedQty: number, packedQty: number, note: string) => {
        if (!selectedItemForDrawer) return;

        const updatedItems = items.map((i) => {
            if (i.id === selectedItemForDrawer.id) {
                const isFullPacked = packedQty >= i.so_qty;
                const hasIssue = note.trim().length > 0;

                return {
                    ...i,
                    picked_qty: pickedQty,
                    packed_qty: packedQty,
                    issue_note: note,
                    status: hasIssue
                        ? ('issue' as const)
                        : isFullPacked
                          ? ('packed' as const)
                          : packedQty > 0
                            ? ('picking' as const)
                            : ('pending' as const),
                    status_label: hasIssue
                        ? 'Ada Catatan Rak'
                        : isFullPacked
                          ? 'Terverifikasi Packed'
                          : packedQty > 0
                            ? `Picking (${packedQty}/${i.so_qty})`
                            : 'Menunggu Picking',
                };
            }
            return i;
        });

        setItems(updatedItems);
        toast.success(`Alokasi & packing item ${selectedItemForDrawer.sku} berhasil diperbarui!`);
    };

    // Commit Dispatch
    const handleConfirmCommit = () => {
        setManifest((prev) => ({
            ...prev,
            status: 'DISPATCHED',
            progress_percentage: 100,
        }));
        setIsCommitModalOpen(false);
        toast.success(`Outbound Pengiriman ${manifest.manifest_code} berhasil disubmit & Surat Jalan diterbitkan!`);
    };

    // Hold Session
    const handleConfirmHold = (reason: string) => {
        setManifest((prev) => ({
            ...prev,
            status: 'HOLD',
        }));
        toast.warning(`Sesi pengiriman di-hold dengan alasan: ${reason}`);
    };

    return (
        <>
            <Head title={`Workspace Outbound - ${manifest.manifest_code}`} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs text-card-foreground">
                    <div className="flex items-start gap-4">
                        <Link
                            href={`/${tenantSlug}/transactions/outbound`}
                            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors mt-0.5 cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl font-bold font-mono text-foreground tracking-tight">
                                    {manifest.manifest_code}
                                </h1>
                                <span
                                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono border ${
                                        manifest.status === 'PACKING'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                            : manifest.status === 'DISPATCHED'
                                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                    }`}
                                >
                                    {manifest.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
                                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                    {manifest.customer_name || 'Customer General'}
                                </span>
                                <span>•</span>
                                <span className="font-mono">
                                    SO: <strong>{manifest.so_number || manifest.manifest_code}</strong>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono">
                                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                    {manifest.vehicle_no || '-'} ({manifest.vehicle_type || '-'})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Control Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSuratJalanOpen(true)}
                            className="bg-card hover:bg-muted border-border text-foreground font-semibold text-xs h-9 px-3.5 rounded-xl gap-1.5 cursor-pointer"
                        >
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Surat Jalan</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsHoldModalOpen(true)}
                            className="bg-card hover:bg-muted border-border text-foreground font-semibold text-xs h-9 px-3.5 rounded-xl gap-1.5 cursor-pointer"
                        >
                            <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Hold Sesi</span>
                        </Button>

                        <Button
                            type="button"
                            onClick={() => setIsCommitModalOpen(true)}
                            disabled={manifest.status === 'DISPATCHED'}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md gap-1.5 cursor-pointer"
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span>Submit Pengiriman</span>
                        </Button>
                    </div>
                </div>

                {/* Scanner & Progress Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Barcode Scanner Input Card */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-xs text-card-foreground flex flex-col justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <QrCode className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        Scan Barcode / SKU Item Outbound
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Arahkan barcode scanner ke kemasan kardus/SKU saat verifikasi packing
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleScanSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="Scan EAN-13 / SKU Barcode item di meja packing..."
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    className="pl-9 bg-muted/50 border-input text-xs font-mono h-10 rounded-xl focus:bg-card"
                                    autoFocus
                                />
                                <QrCode className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl cursor-pointer"
                            >
                                Validate Scan
                            </Button>
                        </form>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs text-card-foreground flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                Progress Verifikasi Packing
                            </span>
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                {manifest.progress_percentage}%
                            </span>
                        </div>

                        <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden my-2">
                            <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${manifest.progress_percentage}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-muted-foreground">
                                Target Total: <strong className="text-foreground">{manifest.total_so_units} Unit</strong>
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {manifest.packed_units} Packed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table View of Items */}
                <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden text-card-foreground">
                    <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground">
                                Daftar SKU &amp; Zone Picking Rak
                            </h3>
                            <span className="px-2 py-0.5 bg-muted/60 text-muted-foreground text-xs font-mono font-bold rounded-md">
                                {items.length} SKU
                            </span>
                        </div>

                        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                    filterStatus === 'all'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilterStatus('picking')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                    filterStatus === 'picking'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Picking
                            </button>
                            <button
                                onClick={() => setFilterStatus('packed')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                    filterStatus === 'packed'
                                        ? 'bg-card text-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Packed
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="py-3 px-5 whitespace-nowrap">SKU &amp; Barcode</th>
                                    <th className="py-3 px-5 whitespace-nowrap">Nama Produk</th>
                                    <th className="py-3 px-5 whitespace-nowrap">Lokasi Rak Asal</th>
                                    <th className="py-3 px-5 text-right whitespace-nowrap">Target SO</th>
                                    <th className="py-3 px-5 text-right whitespace-nowrap">Diambil (Picked)</th>
                                    <th className="py-3 px-5 text-right whitespace-nowrap">Packed</th>
                                    <th className="py-3 px-5 text-center whitespace-nowrap">Status</th>
                                    <th className="py-3 px-5 text-center whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                    {item.sku}
                                                </div>
                                                <div className="font-mono text-[11px] text-muted-foreground">
                                                    {item.barcode}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="font-semibold text-foreground">{item.product_name}</div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {item.category} • Batch: {item.batch_no}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="px-2 py-1 bg-muted/60 border border-border rounded-lg font-mono font-bold text-foreground">
                                                    {item.source_rack}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-right font-mono font-semibold">
                                                {item.so_qty} {item.unit}
                                            </td>
                                            <td className="py-3.5 px-5 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                                                {item.picked_qty} {item.unit}
                                            </td>
                                            <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {item.packed_qty} {item.unit}
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                <span
                                                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${
                                                        item.status === 'packed'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                            : item.status === 'picking'
                                                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                                              : item.status === 'issue'
                                                                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                                                : 'bg-muted/60 text-muted-foreground border-border'
                                                    }`}
                                                >
                                                    {item.status_label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setSelectedItemForDrawer(item)}
                                                    className="h-8 px-3 text-xs font-semibold bg-card hover:bg-muted border-border cursor-pointer"
                                                >
                                                    Detail Packing
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-muted-foreground">
                                            Belum ada item terdaftar pada workspace outbound ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals & Slide-over Drawer */}
            <PackingDrawer
                isOpen={!!selectedItemForDrawer}
                onClose={() => setSelectedItemForDrawer(null)}
                item={selectedItemForDrawer}
                onSave={handleSaveDrawer}
            />

            <DispatchCommitModal
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
                onConfirm={handleConfirmCommit}
                manifest={manifest}
            />

            <HoldShippingModal
                isOpen={isHoldModalOpen}
                onClose={() => setIsHoldModalOpen(false)}
                onConfirm={handleConfirmHold}
            />

            <SuratJalanPreviewModal
                isOpen={isSuratJalanOpen}
                onClose={() => setIsSuratJalanOpen(false)}
                manifest={manifest}
                items={items}
            />
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Transaction', href: '#' },
        { title: 'Outbound Management', href: '#' },
        { title: 'Workspace Pengiriman', href: '#' },
    ],
};
