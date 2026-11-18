import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    CheckCheck,
    ClipboardCheck,
    FileSpreadsheet,
    FileText,
    Printer,
    ScanBarcode,
    Search,
    Warehouse as WarehouseIcon,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/context/language-context';
import type {
    OpnameSession,
    ReconciliationItem,
    StockOpnamePageProps,
} from '@/types/stock-opname';
import { CreateOpnameModal } from './components/CreateOpnameModal';
import { PrintSheetModal } from './components/PrintSheetModal';
import { VerificationModal } from './components/VerificationModal';

const statusStyles: Record<ReconciliationItem['status'], string> = {
    'Belum dihitung': 'border-border bg-muted text-muted-foreground',
    Match: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
    Defisit:
        'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400',
    Surplus:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400',
};

const sessionStatusStyles: Record<OpnameSession['status'], string> = {
    DRAFT: 'border-border bg-muted text-muted-foreground',
    COUNTING:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400',
    REVIEW: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    ADJUSTED:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const normalizeCode = (value: string) => value.trim().toLowerCase();

function getTenantSlug(page: Record<string, any>) {
    const currentPathSlug =
        typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : '';

    return (
        page.current_tenant?.slug ||
        page.auth?.user?.tenant?.slug ||
        currentPathSlug
    );
}

export default function Index({
    session,
    items: initialItems,
    warehouses,
    sessions,
}: StockOpnamePageProps) {
    const { t } = useTranslation();
    const { flash, ...pageProps } = usePage().props as any;
    const tenantSlug = getTenantSlug(pageProps);
    const items = initialItems;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [printOpen, setPrintOpen] = useState(false);
    const [verifyItem, setVerifyItem] = useState<ReconciliationItem | null>(
        null,
    );
    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchesSearch =
                !query ||
                [item.sku, item.barcode, item.name, item.rack].some((value) =>
                    value.toLowerCase().includes(query),
                );

            return (
                matchesSearch &&
                (statusFilter === 'all' || item.status === statusFilter)
            );
        });
    }, [items, search, statusFilter]);

    const countedItems = items.filter((item) => item.is_counted).length;
    const discrepancyItems = items.filter(
        (item) => item.is_counted && item.variance !== 0,
    ).length;
    const netVariance = items.reduce(
        (total, item) => total + (item.is_counted ? item.variance : 0),
        0,
    );
    const canCount = Boolean(
        session && ['DRAFT', 'COUNTING'].includes(session.status),
    );
    const canAdjust =
        items.length > 0 &&
        countedItems === items.length &&
        Boolean(session && ['COUNTING', 'REVIEW'].includes(session.status));

    const showRequestError = (errors: Record<string, string>) => {
        toast.error(
            Object.values(errors)[0] || t('Permintaan gagal diproses.'),
        );
    };

    const handleScannerSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const query = normalizeCode(barcodeInput);

        if (!query) {
            return;
        }

        const found = items.find(
            (item) =>
                normalizeCode(item.barcode) === query ||
                normalizeCode(item.sku) === query ||
                normalizeCode(item.rack) === query,
        );

        if (found) {
            setVerifyItem(found);
            setBarcodeInput('');

            return;
        }

        if (!session) {
            return;
        }

        router.post(
            `/${tenantSlug}/stock-opname/scan`,
            { session_id: session.id, barcode: barcodeInput.trim() },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const refreshedItems = page.props
                        .items as ReconciliationItem[];
                    const scannedItem = refreshedItems.find(
                        (item) =>
                            normalizeCode(item.barcode) === query ||
                            normalizeCode(item.sku) === query,
                    );

                    if (!scannedItem) {
                        toast.error(
                            t('SKU tidak ditemukan pada stok gudang sesi.'),
                        );

                        return;
                    }

                    setVerifyItem(scannedItem);
                    setBarcodeInput('');
                },
                onError: showRequestError,
            },
        );
    };

    const handleItemSave = (updatedItem: ReconciliationItem) => {
        router.post(
            `/${tenantSlug}/stock-opname/verify`,
            {
                item_id: updatedItem.id,
                physical_qty: updatedItem.physical_qty,
                notes: updatedItem.notes,
            },
            {
                preserveScroll: true,
                onError: showRequestError,
            },
        );
    };

    const handleExecuteAdjustment = () => {
        if (!session || !canAdjust) {
            return;
        }

        if (!window.confirm(t('Terapkan hasil hitung ke stok gudang?'))) {
            return;
        }

        router.post(
            `/${tenantSlug}/stock-opname/adjust`,
            { session_id: session.id },
            {
                preserveScroll: true,
                onError: showRequestError,
            },
        );
    };

    const handleExport = (format: 'pdf' | 'excel') => {
        if (!session) {
            return;
        }

        router.post(
            `/${tenantSlug}/stock-opname/export/${format}`,
            { session_id: session.id },
            {
                preserveScroll: true,
                onError: showRequestError,
            },
        );
    };

    const getStatus = (item: ReconciliationItem) => (
        <span
            className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusStyles[item.status]}`}
        >
            {t(item.status)}
        </span>
    );

    return (
        <>
            <Head title={t('Stock opname')} />
            <main className="space-y-5 p-4 sm:p-6">
                <PageHeader
                    title={
                        session
                            ? t('Detail stock opname')
                            : t('Sesi stock opname')
                    }
                    renderAction={
                        <div className="flex flex-wrap items-center gap-2">
                            {session ? (
                                <>
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={`/${tenantSlug}/stock-opname`}
                                        >
                                            {t('Daftar sesi')}
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExport('pdf')}
                                    >
                                        <FileText className="mr-1.5 h-4 w-4 text-rose-600" />{' '}
                                        PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExport('excel')}
                                    >
                                        <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />{' '}
                                        Excel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPrintOpen(true)}
                                    >
                                        <Printer className="mr-1.5 h-4 w-4" />{' '}
                                        {t('Cetak')}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => setCreateOpen(true)}
                                    disabled={warehouses.length === 0}
                                    className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
                                >
                                    <ClipboardCheck className="mr-1.5 h-4 w-4" />{' '}
                                    {t('Buat sesi')}
                                </Button>
                            )}
                        </div>
                    }
                />

                {session ? (
                    <>
                        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                        <WarehouseIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold">
                                                {session.warehouse_name}
                                            </h2>
                                            <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                                {session.session_code}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {session.warehouse_code}{' '}
                                            <span aria-hidden="true">/</span>{' '}
                                            {session.location_label}
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                                    {t(session.status)}
                                </span>
                            </div>

                            {canCount && (
                                <form
                                    onSubmit={handleScannerSubmit}
                                    className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row"
                                >
                                    <div className="relative flex-1">
                                        <ScanBarcode className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={barcodeInput}
                                            onChange={(event) =>
                                                setBarcodeInput(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={t(
                                                'Pindai barcode atau SKU',
                                            )}
                                            className="pl-9"
                                            aria-label={t(
                                                'Pindai barcode atau SKU',
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" variant="outline">
                                        <Check className="mr-1.5 h-4 w-4" />{' '}
                                        {t('Hitung')}
                                    </Button>
                                </form>
                            )}
                        </section>

                        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {[
                                {
                                    label: t('SKU'),
                                    value: items.length,
                                    color: 'text-foreground',
                                },
                                {
                                    label: t('Sudah dihitung'),
                                    value: `${countedItems}/${items.length}`,
                                    color: 'text-blue-600 dark:text-blue-400',
                                },
                                {
                                    label: t('SKU selisih'),
                                    value: discrepancyItems,
                                    color: 'text-amber-600 dark:text-amber-400',
                                },
                                {
                                    label: t('Selisih bersih'),
                                    value: `${netVariance > 0 ? '+' : ''}${netVariance}`,
                                    color: 'text-foreground',
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-border bg-card px-4 py-3"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p
                                        className={`mt-1 text-xl font-semibold tabular-nums ${stat.color}`}
                                    >
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
                            <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder={t(
                                            'Cari SKU, barcode, nama, atau rak',
                                        )}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="w-full sm:w-44">
                                        <SelectValue
                                            placeholder={t('Semua status')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('Semua status')}
                                        </SelectItem>
                                        <SelectItem value="Belum dihitung">
                                            {t('Belum dihitung')}
                                        </SelectItem>
                                        <SelectItem value="Match">
                                            {t('Match')}
                                        </SelectItem>
                                        <SelectItem value="Defisit">
                                            {t('Defisit')}
                                        </SelectItem>
                                        <SelectItem value="Surplus">
                                            {t('Surplus')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">
                                                {t('Barang')}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t('Rak')}
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                {t('Sistem')}
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                {t('Fisik')}
                                            </th>
                                            <th className="px-4 py-3 text-right">
                                                {t('Selisih')}
                                            </th>
                                            <th className="px-4 py-3">
                                                {t('Status')}
                                            </th>
                                            <th className="w-12 px-3 py-3">
                                                <span className="sr-only">
                                                    {t('Aksi')}
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredItems.length ? (
                                            filteredItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {item.name}
                                                        </p>
                                                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                            {item.sku} ·{' '}
                                                            {item.barcode}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p>{item.rack}</p>
                                                        {item.batch !== '-' && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {item.batch}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {item.system_qty}{' '}
                                                        {item.unit}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {item.is_counted
                                                            ? `${item.physical_qty} ${item.unit}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                                                        {item.is_counted
                                                            ? `${item.variance > 0 ? '+' : ''}${item.variance}`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatus(item)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        {canCount && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`${t('Hitung')} ${item.sku}`}
                                                                onClick={() =>
                                                                    setVerifyItem(
                                                                        item,
                                                                    )
                                                                }
                                                            >
                                                                <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                                                >
                                                    {t(
                                                        'Tidak ada barang yang cocok dengan pencarian.',
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <footer className="flex flex-col gap-3 border-t border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {filteredItems.length} {t('dari')}{' '}
                                    {items.length} {t('SKU')}
                                    {netVariance !== 0 && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            {netVariance > 0 ? '+' : ''}
                                            {netVariance}
                                        </span>
                                    )}
                                </p>
                                {session.status !== 'ADJUSTED' && (
                                    <Button
                                        onClick={handleExecuteAdjustment}
                                        disabled={!canAdjust}
                                        className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
                                    >
                                        <CheckCheck className="mr-1.5 h-4 w-4" />{' '}
                                        {t('Terapkan penyesuaian')}
                                    </Button>
                                )}
                            </footer>
                        </section>
                    </>
                ) : sessions.data.length > 0 ? (
                    <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h2 className="font-semibold">
                                {t('Riwayat sesi')}
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {sessions.total}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">
                                            {t('Sesi')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('Gudang / zona')}
                                        </th>
                                        <th className="px-4 py-3 text-center">
                                            {t('Hitungan')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('Status')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('Dibuat')}
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            {t('Aksi')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {sessions.data.map((opnameSession) => {
                                        const canResume = [
                                            'DRAFT',
                                            'COUNTING',
                                        ].includes(opnameSession.status);

                                        return (
                                            <tr
                                                key={opnameSession.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">
                                                        {
                                                            opnameSession.session_code
                                                        }
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {opnameSession.auditor_name ||
                                                            '—'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p>
                                                        {
                                                            opnameSession.warehouse_name
                                                        }
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {
                                                            opnameSession.warehouse_code
                                                        }{' '}
                                                        /{' '}
                                                        {
                                                            opnameSession.location_label
                                                        }
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-center tabular-nums">
                                                    {
                                                        opnameSession.counted_items
                                                    }
                                                    /{opnameSession.total_items}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${sessionStatusStyles[opnameSession.status]}`}
                                                    >
                                                        {t(
                                                            opnameSession.status,
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        opnameSession.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={`/${tenantSlug}/stock-opname?session_id=${opnameSession.id}`}
                                                        >
                                                            {canResume
                                                                ? t('Lanjutkan')
                                                                : t('Detail')}
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {sessions.last_page > 1 && (
                            <nav
                                aria-label={t('Navigasi halaman sesi')}
                                className="flex items-center justify-between border-t border-border px-4 py-3"
                            >
                                <span className="text-sm text-muted-foreground">
                                    {t('Halaman')} {sessions.current_page}{' '}
                                    {t('dari')} {sessions.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    {sessions.links.map((link, index) => {
                                        const isPrevious = index === 0;
                                        const isNext =
                                            index === sessions.links.length - 1;
                                        const label = isPrevious
                                            ? t('Sebelumnya')
                                            : isNext
                                              ? t('Berikutnya')
                                              : link.label;

                                        return link.url ? (
                                            <Link
                                                key={`${link.label}-${index}`}
                                                href={link.url}
                                                aria-current={
                                                    link.active
                                                        ? 'page'
                                                        : undefined
                                                }
                                                aria-label={
                                                    isPrevious || isNext
                                                        ? label
                                                        : undefined
                                                }
                                                className={`rounded-md border px-2.5 py-1.5 text-sm ${link.active ? 'border-blue-600 bg-blue-600 text-white' : 'border-border text-foreground hover:bg-muted'}`}
                                            >
                                                {label}
                                            </Link>
                                        ) : (
                                            <span
                                                key={`${link.label}-${index}`}
                                                aria-hidden="true"
                                                className="rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground opacity-50"
                                            >
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </nav>
                        )}
                    </section>
                ) : (
                    <section className="rounded-xl border border-border bg-card px-5 py-14 text-center">
                        <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h2 className="mt-3 font-semibold">
                            {t('Belum ada sesi opname')}
                        </h2>
                        {warehouses.length === 0 && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('Tambahkan gudang aktif terlebih dahulu.')}
                            </p>
                        )}
                    </section>
                )}
            </main>

            <CreateOpnameModal
                isOpen={createOpen}
                warehouses={warehouses}
                onClose={() => setCreateOpen(false)}
            />
            <VerificationModal
                key={verifyItem?.id ?? 'no-item'}
                isOpen={Boolean(verifyItem)}
                item={verifyItem}
                onClose={() => setVerifyItem(null)}
                onSaveSuccess={handleItemSave}
            />
            {session && (
                <PrintSheetModal
                    isOpen={printOpen}
                    session={session as OpnameSession}
                    items={items}
                    onClose={() => setPrintOpen(false)}
                />
            )}
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Warehouse & Stocks', href: '#' },
        { title: 'Stock Opname', href: '#' },
    ],
};
