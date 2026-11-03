import React, { useState, useEffect } from 'react';
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
    Printer,
    ScanBarcode,
    Truck,
    SlidersHorizontal,
    Pencil,
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
import type { InboundManifest, InboundItem } from '@/types/inbound';

import { BapPreviewModal } from './components/BapPreviewModal';
import { CommitModal } from './components/CommitModal';
import { HoldSessionModal } from './components/HoldSessionModal';
import { PutawayModal } from './components/PutawayModal';

interface LocationOption {
    id: number;
    rack_code: string;
    zone?: string;
}

interface InboundShowProps {
    manifest: InboundManifest;
    items: InboundItem[];
    locations?: LocationOption[];
}

export default function Show({
    manifest: initialManifest,
    items: initialItems,
    locations = [],
}: InboundShowProps) {
    const { t } = useTranslation();
    const { current_tenant, auth, flash } = usePage().props as any;
    const { can } = usePermission();

    const [manifest, setManifest] = useState<InboundManifest>(initialManifest);
    const [items, setItems] = useState<InboundItem[]>(initialItems || []);
    const [filterTab, setFilterTab] = useState<
        'all' | 'valid' | 'process' | 'issue'
    >('all');
    const [barcodeInput, setBarcodeInput] = useState<string>('');

    // Modal States
    const [selectedDrawerItem, setSelectedDrawerItem] =
        useState<InboundItem | null>(null);
    const [isBapModalOpen, setIsBapModalOpen] = useState<boolean>(false);
    const [isCommitModalOpen, setIsCommitModalOpen] = useState<boolean>(false);
    const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);

    const currentPathSlug =
        typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : '';
    const tenantSlug =
        current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    useEffect(() => {
        setManifest(initialManifest);
        setItems(initialItems || []);
    }, [initialManifest, initialItems]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);

    // Stat Agregasi
    const totalLineSku = items.length;
    const totalGoodUnits = items.reduce((acc, curr) => acc + curr.good_qty, 0);
    const totalDamagedUnits = items.reduce(
        (acc, curr) => acc + curr.damaged_qty,
        0,
    );
    const totalPoUnits = items.reduce((acc, curr) => acc + curr.po_qty, 0);
    const progressPct =
        totalPoUnits > 0
            ? (
                  ((totalGoodUnits + totalDamagedUnits) / totalPoUnits) *
                  100
              ).toFixed(1)
            : '0';

    const isSessionFrozen =
        manifest.status === 'ON_HOLD' ||
        manifest.status === 'HOLD' ||
        manifest.status === 'COMMITTED' ||
        manifest.status === 'CLOSED';

    const filteredItems = items.filter((item) => {
        if (filterTab === 'valid') return item.status === 'valid';
        if (filterTab === 'process') return item.status === 'process';
        if (filterTab === 'issue') return item.status === 'issue';
        return true;
    });

    const validCount = items.filter((i) => i.status === 'valid').length;
    const processCount = items.filter((i) => i.status === 'process').length;
    const issueCount = items.filter((i) => i.status === 'issue').length;

    const handleScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        if (isSessionFrozen) {
            toast.warning(
                t(
                    'Sesi penerimaan sedang dibekukan. Lanjutkan sesi terlebih dahulu.',
                ),
            );
            return;
        }

        if (!can('tenant.inbound.verify_barcode')) {
            toast.error(
                t('Anda tidak memiliki izin untuk verifikasi barcode.'),
            );
            return;
        }

        router.post(
            `/${tenantSlug}/transactions/inbound/verify-barcode`,
            { manifest_code: manifest.manifest_code, barcode: code },
            {
                preserveScroll: true,
                onSuccess: () => setBarcodeInput(''),
            },
        );
    };

    const handlePutawaySave = (
        goodQty: number,
        damagedQty: number,
        rack: string,
        note: string,
    ) => {
        if (!selectedDrawerItem) return;

        if (!can('tenant.inbound.putaway')) {
            toast.error(t('Anda tidak memiliki izin untuk alokasi putaway.'));
            return;
        }

        router.post(
            `/${tenantSlug}/transactions/inbound/putaway`,
            {
                item_id: selectedDrawerItem.id,
                good_qty: goodQty,
                damaged_qty: damagedQty,
                target_rack: rack,
                damage_note: note,
            },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedDrawerItem(null),
            },
        );
    };

    const handleCommit = () => {
        if (!can('tenant.inbound.commit')) {
            toast.error(t('Anda tidak memiliki izin untuk commit inbound.'));
            return;
        }

        setIsCommitModalOpen(false);
        router.post(
            `/${tenantSlug}/transactions/inbound/commit`,
            { manifest_code: manifest.manifest_code },
            { preserveScroll: true },
        );
    };

    const handleHoldSession = (reason: string) => {
        if (!can('tenant.inbound.hold')) {
            toast.error(
                t('Anda tidak memiliki izin untuk menunda sesi inbound.'),
            );
            return;
        }

        setIsHoldModalOpen(false);
        router.post(
            `/${tenantSlug}/transactions/inbound/hold`,
            { manifest_code: manifest.manifest_code, reason },
            { preserveScroll: true },
        );
    };

    const handleResumeSession = () => {
        router.post(
            `/${tenantSlug}/transactions/inbound/resume`,
            { manifest_code: manifest.manifest_code },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={`Inbound ${manifest.manifest_code}`} />

            <div className="space-y-6 p-4 font-sans text-xs">
                {/* HEADER CONTROL BAR */}
                <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/${tenantSlug}/transactions/inbound`}
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
                                            manifest.status === 'ON_HOLD' ||
                                            manifest.status === 'HOLD'
                                                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                                : manifest.status ===
                                                        'COMMITTED' ||
                                                    manifest.status === 'CLOSED'
                                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                  : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                manifest.status === 'ON_HOLD' ||
                                                manifest.status === 'HOLD'
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                            }`}
                                        />
                                        {manifest.status}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>{manifest.supplier_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS TOP BAR */}
                        <div className="flex items-center gap-2">
                            {manifest.status === 'ON_HOLD' ||
                            manifest.status === 'HOLD' ? (
                                <Button
                                    type="button"
                                    onClick={handleResumeSession}
                                    className="h-8 gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
                                >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>{t('Resume Sesi')}</span>
                                </Button>
                            ) : (
                                can('tenant.inbound.hold') &&
                                manifest.status !== 'COMMITTED' &&
                                manifest.status !== 'CLOSED' && (
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

                            {can('tenant.inbound.commit') &&
                                manifest.status !== 'COMMITTED' &&
                                manifest.status !== 'CLOSED' && (
                                    <Button
                                        type="button"
                                        disabled={
                                            manifest.status === 'ON_HOLD' ||
                                            manifest.status === 'HOLD'
                                        }
                                        onClick={() =>
                                            setIsCommitModalOpen(true)
                                        }
                                        className="h-8 gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        <span>{t('Commit ke Rak')}</span>
                                    </Button>
                                )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsBapModalOpen(true)}
                                className="h-8 gap-1.5 rounded-md border-border px-3 text-xs font-medium"
                            >
                                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{t('Cetak BAP')}</span>
                            </Button>
                        </div>
                    </div>

                    {/* BARCODE SCANNER TOOLBAR */}
                    {can('tenant.inbound.verify_barcode') && (
                        <form
                            onSubmit={handleScanSubmit}
                            className="flex items-center gap-2 pt-4"
                        >
                            <div className="relative flex-1">
                                <ScanBarcode className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    disabled={isSessionFrozen}
                                    value={barcodeInput}
                                    onChange={(e) =>
                                        setBarcodeInput(e.target.value)
                                    }
                                    placeholder={
                                        isSessionFrozen
                                            ? t('Sesi penerimaan dibekukan...')
                                            : t('Scan Barcode / Kode SKU...')
                                    }
                                    className="h-9 rounded-md border-border bg-background pr-12 pl-9 font-mono text-xs"
                                />
                                <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                    Enter
                                </kbd>
                            </div>
                            <Button
                                type="submit"
                                disabled={isSessionFrozen}
                                className="h-9 gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground"
                            >
                                <Check className="h-3.5 w-3.5" />
                                <span>{t('Verifikasi')}</span>
                            </Button>
                        </form>
                    )}
                </div>

                {/* KPI METRICS STRIP */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">
                                {t('Total SKU')}
                            </span>
                            <div className="mt-1 text-xl font-bold text-foreground">
                                {totalLineSku}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({totalPoUnits} Unit)
                                </span>
                            </div>
                        </div>
                        <Boxes className="h-5 w-5 text-muted-foreground/70" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">
                                {t('Valid (Baik)')}
                            </span>
                            <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {totalGoodUnits} Unit
                            </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500/70" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">
                                {t('Rusak (BAP)')}
                            </span>
                            <div className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                                {totalDamagedUnits} Unit
                            </div>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-amber-500/70" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-md">
                        <div>
                            <span className="font-medium text-muted-foreground">
                                {t('Progress Total')}
                            </span>
                            <div className="mt-1 text-xl font-bold text-foreground">
                                {progressPct}%
                            </div>
                        </div>
                        <Truck className="h-5 w-5 text-indigo-500/70" />
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="rounded-lg bg-card text-card-foreground shadow-md border border-border overflow-hidden">
                    {/* Controls & Filter Tabs Bar */}
                    <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20">
                        <span className="font-bold text-sm text-foreground">
                            {t('Detail Item Receiving & Putaway')}
                        </span>
                        <div className="flex items-center space-x-2">
                            {(
                                ['all', 'valid', 'process', 'issue'] as const
                            ).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setFilterTab(tab)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                        filterTab === tab
                                            ? 'border border-border bg-background text-foreground shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab === 'all' && `Semua (${items.length})`}
                                    {tab === 'valid' && `Valid (${validCount})`}
                                    {tab === 'process' &&
                                        `Proses (${processCount})`}
                                    {tab === 'issue' && `BAP (${issueCount})`}
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
                                    <th className="p-4 font-semibold">Batch / Exp</th>
                                    <th className="p-4 font-semibold text-right">Target PO</th>
                                    <th className="p-4 font-semibold text-right">Fisik Diterima</th>
                                    <th className="p-4 font-semibold">Lokasi Rak</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    {can('tenant.inbound.putaway') && (
                                        <th className="p-4 font-semibold text-right">{t("Actions")}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="p-4 font-mono font-semibold text-primary">
                                                {item.sku}
                                                <div className="text-[10px] font-normal text-muted-foreground">
                                                    {item.barcode}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-foreground">
                                                    {item.product_name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {item.category}
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs">
                                                {item.batch_no}
                                                <div className="text-[10px] text-muted-foreground">
                                                    {item.exp_date}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-mono text-xs">
                                                {item.po_qty} {item.unit}
                                            </td>
                                            <td className="p-4 text-right font-mono text-xs font-medium">
                                                {item.good_qty} Baik{' '}
                                                {item.damaged_qty > 0 && (
                                                    <span className="font-bold text-amber-600">
                                                        ({item.damaged_qty} Rusak)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                                                    {item.target_rack}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium">
                                                    {item.status_label}
                                                </span>
                                            </td>
                                            {can('tenant.inbound.putaway') && (
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                {t("Actions")}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem
                                                                onClick={() => setSelectedDrawerItem(item)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                <span>{t("Edit / Alokasi Rak")}</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                can('tenant.inbound.putaway')
                                                    ? 8
                                                    : 7
                                            }
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            Tidak ada item penerimaan aktif.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {can('tenant.inbound.putaway') && (
                <PutawayModal
                    isOpen={Boolean(selectedDrawerItem)}
                    onClose={() => setSelectedDrawerItem(null)}
                    item={selectedDrawerItem}
                    locations={locations}
                    onSave={handlePutawaySave}
                />
            )}

            <BapPreviewModal
                isOpen={isBapModalOpen}
                onClose={() => setIsBapModalOpen(false)}
                manifest={manifest}
                items={items}
            />

            {can('tenant.inbound.commit') && (
                <CommitModal
                    isOpen={isCommitModalOpen}
                    onClose={() => setIsCommitModalOpen(false)}
                    onConfirm={handleCommit}
                    manifest={manifest}
                />
            )}

            {can('tenant.inbound.hold') && (
                <HoldSessionModal
                    isOpen={isHoldModalOpen}
                    onClose={() => setIsHoldModalOpen(false)}
                    onConfirm={handleHoldSession}
                />
            )}
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Transaction', href: '#' },
        { title: 'Inbound Management', href: '/transactions/inbound' },
        { title: 'Workspace Receiving', href: '#' },
    ],
};
