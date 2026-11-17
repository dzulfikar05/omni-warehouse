import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    Play,
    PauseCircle,
    ScanBarcode,
    Truck,
    Pencil,
    Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import type { OutboundManifest, OutboundItem } from '@/types/outbound';

import { CommitModal } from './components/CommitModal';
import { HoldSessionModal } from './components/HoldSessionModal';
import { PickingModal } from './components/PickingModal';
import { SuratJalanPreviewModal } from './components/SuratJalanPreviewModal';

interface LocationOption {
    id: number;
    rack_code: string;
    zone?: string;
}

interface OutboundShowProps {
    manifest: OutboundManifest;
    items: OutboundItem[];
    locations?: LocationOption[];
}

type FilterTabOption = 'all' | 'valid' | 'process' | 'issue';
type OutboundItemWithGoodQty = OutboundItem & { good_qty?: number | string | null };
type OutboundItemWithDamage = OutboundItem & { damaged_qty?: number | string | null };
type OutboundItemWithNotes = OutboundItem & {
    damage_note?: string | null;
    issue_note?: string | null;
};

const getDamagedQty = (item: OutboundItem) => Number((item as OutboundItemWithDamage).damaged_qty) || 0;

// Menyelaraskan status beku dan selesai untuk mengaktifkan Surat Jalan & Lock Input Barcode
const FROZEN_STATUS_LIST: OutboundManifest['status'][] = ['HOLD', 'COMMITTED', 'DISPATCHED', 'CLOSED'];
const COMPLETED_STATUS_LIST: OutboundManifest['status'][] = ['COMMITTED', 'DISPATCHED', 'CLOSED'];

export default function Show({
    manifest: initialManifest,
    items: initialItems = [],
    locations = [],
}: OutboundShowProps) {
    const { t } = useTranslation();
    const { current_tenant, auth, flash } = usePage().props as any;
    const { can } = usePermission();

    const [manifest, setManifest] = useState<OutboundManifest>(initialManifest);
    const [items, setItems] = useState<OutboundItem[]>(initialItems);
    const [filterTab, setFilterTab] = useState<FilterTabOption>('all');
    const [barcodeInput, setBarcodeInput] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [selectedDrawerItem, setSelectedDrawerItem] = useState<OutboundItem | null>(null);
    const [isCommitModalOpen, setIsCommitModalOpen] = useState<boolean>(false);
    const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);
    const [isSuratJalanOpen, setIsSuratJalanOpen] = useState<boolean>(false);

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;
    const basePath = `/${tenantSlug}/transactions/outbound`;

    useEffect(() => {
        setManifest(initialManifest);
        setItems(initialItems || []);
    }, [initialManifest, initialItems]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);

    const currentStatus = manifest.status;
    const isSessionFrozen = useMemo(
        () => FROZEN_STATUS_LIST.includes(currentStatus),
        [currentStatus]
    );
    const isCompleted = useMemo(
        () => COMPLETED_STATUS_LIST.includes(currentStatus),
        [currentStatus]
    );
    const isHold = currentStatus === 'HOLD';

    const { totalLineSku, totalGoodUnits, totalDamagedUnits, totalTargetUnits, progressPct } = useMemo(() => {
        const lineSku = items.length;
        const good = items.reduce((acc, curr) => acc + (Number((curr as OutboundItemWithGoodQty).good_qty) || 0), 0);
        const damaged = items.reduce((acc, curr) => acc + getDamagedQty(curr), 0);
        const target = items.reduce((acc, curr) => acc + (Number(curr.so_qty) || 0), 0);
        const progress = target > 0 ? (((good + damaged) / target) * 100).toFixed(1) : '0';

        return {
            totalLineSku: lineSku,
            totalGoodUnits: good,
            totalDamagedUnits: damaged,
            totalTargetUnits: target,
            progressPct: progress,
        };
    }, [items]);

    const { filteredItems, validCount, processCount, issueCount } = useMemo(() => {
        const valid = items.filter((i) => i.status === 'packed').length;
        const process = items.filter((i) => i.status === 'pending' || i.status === 'picking').length;
        const issue = items.filter((i) => i.status === 'issue' || getDamagedQty(i) > 0).length;

        const filtered = items.filter((item) => {
            if (filterTab === 'valid') return item.status === 'packed';
            if (filterTab === 'process') return item.status === 'pending' || item.status === 'picking';
            if (filterTab === 'issue') return item.status === 'issue' || getDamagedQty(item) > 0;
            return true;
        });

        return { filteredItems: filtered, validCount: valid, processCount: process, issueCount: issue };
    }, [items, filterTab]);

    const handleScanSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const code = barcodeInput.trim();
            if (!code || isSubmitting) return;

            if (isSessionFrozen) {
                toast.warning(t('Sesi picking sedang dibekukan atau telah selesai.'));
                return;
            }

            setIsSubmitting(true);
            router.post(
                `${basePath}/verify-barcode`,
                { manifest_code: manifest.manifest_code, barcode: code },
                {
                    preserveScroll: true,
                    onSuccess: () => setBarcodeInput(''),
                    onFinish: () => setIsSubmitting(false),
                },
            );
        },
        [barcodeInput, isSubmitting, isSessionFrozen, basePath, manifest.manifest_code, t],
    );

    const handlePickingSave = useCallback(
        (goodQty: number, damagedQty: number, rackId: number | null, note: string) => {
            if (!selectedDrawerItem) return;

            router.post(
                `${basePath}/update-picking`,
                {
                    item_id: selectedDrawerItem.id,
                    good_qty: goodQty,
                    damaged_qty: damagedQty,
                    source_rack_id: rackId,
                    damage_note: note,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => setSelectedDrawerItem(null),
                },
            );
        },
        [selectedDrawerItem, basePath],
    );

    const handleCommit = useCallback(() => {
        setIsCommitModalOpen(false);
        router.post(
            `${basePath}/commit`,
            { manifest_code: manifest.manifest_code },
            { preserveScroll: true },
        );
    }, [basePath, manifest.manifest_code]);

    const handleHoldSession = useCallback(
        (reason: string) => {
            setIsHoldModalOpen(false);
            router.post(
                `${basePath}/hold`,
                { manifest_code: manifest.manifest_code, reason },
                { preserveScroll: true },
            );
        },
        [basePath, manifest.manifest_code],
    );

    const handleResumeSession = useCallback(() => {
        router.post(
            `${basePath}/resume`,
            { manifest_code: manifest.manifest_code },
            { preserveScroll: true },
        );
    }, [basePath, manifest.manifest_code]);

    return (
        <>
            <Head title={`Outbound ${manifest.manifest_code}`} />

            <div className="space-y-6 p-4 font-sans text-xs">
                <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-3">
                            <Link
                                href={basePath}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                                        {manifest.manifest_code}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${
                                            isHold
                                                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                                : isCompleted
                                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                  : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                isHold ? 'bg-amber-500' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}
                                        />
                                        {manifest.status}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>Customer: {manifest.customer_name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isCompleted && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsSuratJalanOpen(true)}
                                    className="h-8 gap-1.5 rounded-md border-border px-3 text-xs font-medium"
                                >
                                    <Printer className="h-3.5 w-3.5 text-blue-600" />
                                    <span>{t('Cetak Surat Jalan')}</span>
                                </Button>
                            )}

                            {isHold ? (
                                <Button
                                    type="button"
                                    onClick={handleResumeSession}
                                    className="h-8 gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
                                >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>{t('Resume Sesi')}</span>
                                </Button>
                            ) : (
                                can('tenant.outbound.hold') &&
                                !isCompleted && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsHoldModalOpen(true)}
                                        className="h-8 gap-1.5 rounded-md border-border px-3 text-xs font-medium"
                                    >
                                        <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                                        <span>{t('Hold Sesi')}</span>
                                    </Button>
                                )
                            )}

                            {can('tenant.outbound.commit') && !isCompleted && (
                                <Button
                                    type="button"
                                    disabled={isHold}
                                    onClick={() => setIsCommitModalOpen(true)}
                                    className="h-8 gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    <span>{t('Potong Stok & Commit')}</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleScanSubmit} className="flex items-center gap-2 pt-4">
                        <div className="relative flex-1">
                            <ScanBarcode className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                disabled={isSessionFrozen}
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                placeholder={
                                    isSessionFrozen
                                        ? t('Sesi picking dibekukan / selesai...')
                                        : t('Scan Barcode SKU untuk picking...')
                                }
                                className="h-9 rounded-md border-border bg-background pr-12 pl-9 font-mono text-xs"
                            />
                            <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                Enter
                            </kbd>
                        </div>
                        <Button
                            type="submit"
                            disabled={isSessionFrozen || isSubmitting}
                            className="h-9 gap-1.5 rounded-md px-4 text-xs font-medium text-primary-foreground bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>{isSubmitting ? t('Verifikasi...') : t('Verifikasi')}</span>
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">{t('Total SKU Demand')}</span>
                            <div className="mt-1 text-xl font-bold text-foreground">
                                {totalLineSku} <span className="text-xs font-normal text-muted-foreground">({totalTargetUnits} Unit)</span>
                            </div>
                        </div>
                        <Boxes className="h-5 w-5 text-muted-foreground/70" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">{t('Picked (Baik)')}</span>
                            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {totalGoodUnits} Unit
                            </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500/70" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">{t('Batal / Rusak')}</span>
                            <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                                {totalDamagedUnits} Unit
                            </div>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-amber-500/70" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">{t('Progress Picking')}</span>
                            <div className="mt-1 text-xl font-bold text-foreground">{progressPct}%</div>
                        </div>
                        <Truck className="h-5 w-5 text-indigo-500/70" />
                    </div>
                </div>

                <div className="rounded-lg bg-card text-card-foreground shadow-md border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20">
                        <span className="font-bold text-sm text-foreground">
                            {t('Detail Item Picking & Rak Asal')}
                        </span>
                        <div className="flex items-center space-x-2">
                            {(['all', 'valid', 'process', 'issue'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setFilterTab(tab)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                                        filterTab === tab
                                            ? 'border border-border bg-background text-foreground shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab === 'all' && `Semua (${items.length})`}
                                    {tab === 'valid' && `Valid (${validCount})`}
                                    {tab === 'process' && `Proses (${processCount})`}
                                    {tab === 'issue' && `Ada Selisih (${issueCount})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                    <th className="p-4 font-semibold">SKU / Barcode</th>
                                    <th className="p-4 font-semibold">Nama Produk</th>
                                    <th className="p-4 font-semibold text-right">Target Demand SO</th>
                                    <th className="p-4 font-semibold text-right">Fisik Dipick</th>
                                    <th className="p-4 font-semibold">Rak Asal (Source Rack)</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => {
                                        const targetQty = Number(item.so_qty) || 0;
                                        const damagedQty = getDamagedQty(item);
                                        const goodQty = Number((item as OutboundItemWithGoodQty).good_qty) || 0;
                                        const noteItem = item as OutboundItemWithNotes;
                                        const noteText = noteItem.damage_note ?? noteItem.issue_note ?? null;

                                        return (
                                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="p-4 font-mono font-semibold text-primary">
                                                    {item.sku}
                                                    <div className="text-[10px] font-normal text-muted-foreground">
                                                        {item.barcode}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-foreground">
                                                    {item.product_name}
                                                    {noteText && (
                                                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 italic">
                                                            Catatan: {noteText}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right font-mono text-xs">
                                                    {targetQty} {item.unit}
                                                </td>
                                                <td className="p-4 text-right font-mono text-xs font-medium">
                                                    {goodQty} Baik{' '}
                                                    {damagedQty > 0 && (
                                                        <span className="font-bold text-amber-600">
                                                            ({damagedQty} Batal/Rusak)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                                                        {item.source_rack || 'Belum Dialokasi'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium">
                                                        {item.status_label || item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm" disabled={isSessionFrozen}>
                                                                {t('Actions')}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem
                                                                onClick={() => setSelectedDrawerItem(item)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                <span>{t('Edit Picking / Rak')}</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                                            {t('Tidak ada item picking aktif.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PickingModal
                isOpen={Boolean(selectedDrawerItem)}
                onClose={() => setSelectedDrawerItem(null)}
                item={selectedDrawerItem}
                locations={locations}
                onSave={handlePickingSave}
            />

            <CommitModal
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
                onConfirm={handleCommit}
                manifest={manifest}
            />

            <HoldSessionModal
                isOpen={isHoldModalOpen}
                onClose={() => setIsHoldModalOpen(false)}
                onConfirm={handleHoldSession}
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
        { title: 'Outbound Management', href: '/transactions/outbound' },
        { title: 'Workspace Picking', href: '#' },
    ],
};
