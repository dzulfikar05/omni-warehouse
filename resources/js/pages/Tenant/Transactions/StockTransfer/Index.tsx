import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Layers,
    MoreHorizontal,
    PackageCheck,
    Pencil,
    Plus,
    Eye,
    XCircle,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import {
    TransactionFilterBar,
    transactionStatusLabel,
} from '../components/TransactionFilterBar';
import type { TransactionFilters } from '../components/TransactionFilterBar';
import { TransactionPagination } from '../components/TransactionPagination';
import { CreateTransferModal } from './components/CreateTransferModal';
import { TransferDetailModal } from './components/TransferDetailModal';
import type {
    LocationOption,
    SkuOption,
    StockTransferHeaderItem,
    StockTransferSummary,
    WarehouseOption,
} from './types/stock_transfer';

interface TransferPage {
    data: StockTransferHeaderItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface StockTransferIndexProps {
    tenant_slug: string;
    transfers: TransferPage;
    warehouses: WarehouseOption[];
    locations: LocationOption[];
    skus: SkuOption[];
    summary: StockTransferSummary;
    statuses: string[];
    filters: Partial<TransactionFilters>;
}

export default function StockTransferIndex({
    tenant_slug,
    transfers,
    warehouses,
    locations,
    skus,
    summary,
    statuses,
    filters,
}: StockTransferIndexProps) {
    const { t } = useTranslation();
    const { current_tenant, auth, flash } = usePage().props as any;
    const { can } = usePermission();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] =
        useState<StockTransferHeaderItem | null>(null);
    const [selectedTransfer, setSelectedTransfer] =
        useState<StockTransferHeaderItem | null>(null);
    const [transferToCancel, setTransferToCancel] =
        useState<StockTransferHeaderItem | null>(null);
    const lastShownFlash = useRef<string | null>(null);

    const currentPathSlug =
        typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : tenant_slug;
    const tenantSlug =
        current_tenant?.slug ||
        auth?.user?.tenant?.slug ||
        tenant_slug ||
        currentPathSlug;
    const route = `/${tenantSlug}/transactions/stock-transfer`;

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(t('toast_success'), { description: flash.success });
            lastShownFlash.current = flash.success;
        }

        if (flash?.error && lastShownFlash.current !== flash.error) {
            toast.error(t('toast_error'), { description: flash.error });
            lastShownFlash.current = flash.error;
        }
    }, [flash?.error, flash?.success, t]);

    const stats = [
        {
            label: 'stat_total_transactions',
            value: summary.total_transfers,
            icon: Layers,
        },
        {
            label: 'stat_pending_transactions',
            value: summary.in_transit,
            icon: Clock,
        },
        {
            label: 'stat_completed_transactions',
            value: summary.completed,
            icon: CheckCircle2,
        },
        {
            label: 'stat_total_units',
            value: summary.total_units_moved,
            icon: PackageCheck,
        },
    ];

    return (
        <>
            <Head title={t('page_stock_transfer_transactions')} />
            <main className="space-y-6 p-4 font-sans sm:p-6">
                <PageHeader
                    title={t('page_stock_transfer_transactions')}
                    description={t(
                        'Kelola relokasi stok internal, replenishment rak penyimpanan, dan mutasi barang.',
                    )}
                    renderAction={
                        can('tenant.stock_transfer.create') ? (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Plus className="size-4" />
                                {t('Buat Transfer Stok')}
                            </Button>
                        ) : null
                    }
                />

                {/* Cards Summary */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(({ label, value, icon: Icon }) => (
                        <article
                            key={label}
                            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm"
                        >
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t(label)}
                                </p>
                                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                    {(value || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-xl bg-muted p-3 text-primary">
                                <Icon className="size-5" />
                            </div>
                        </article>
                    ))}
                </section>

                <TransactionFilterBar
                    route={route}
                    kind="stock-transfer"
                    filters={filters}
                    statuses={statuses}
                    warehouses={warehouses}
                />

                {/* Table Data Header */}
                <section className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_reference')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('Ringkasan Batch Item')}
                                    </th>
                                    <th className="px-5 py-3.5 text-center whitespace-nowrap">
                                        {t('Total Qty Unit')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_status')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_created_at')}
                                    </th>
                                    <th className="px-5 py-3.5 text-right whitespace-nowrap">
                                        {t('Aksi')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transfers.data && transfers.data.length > 0 ? (
                                    transfers.data.map((transfer) => (
                                        <tr
                                            key={transfer.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">
                                                {transfer.transfer_code}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    {transfer.total_skus}{' '}
                                                    {t('Variasi SKU Barang')}
                                                </p>
                                                {transfer.notes && (
                                                    <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                                                        {transfer.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center font-mono font-bold text-foreground">
                                                {transfer.total_quantity}{' '}
                                                {t('pcs')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                                    {transactionStatusLabel(
                                                        transfer.status,
                                                        t,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs whitespace-nowrap text-muted-foreground">
                                                {transfer.created_at}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`${t('Aksi untuk')} ${transfer.transfer_code}`}
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {can(
                                                            'tenant.stock_transfer.view',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setSelectedTransfer(
                                                                        transfer,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 size-4" />
                                                                {t('Detail')}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can(
                                                            'tenant.stock_transfer.edit',
                                                        ) &&
                                                            [
                                                                'pending',
                                                                'draft',
                                                            ].includes(
                                                                transfer.status.toLowerCase(),
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditingTransfer(
                                                                            transfer,
                                                                        );
                                                                        setIsCreateModalOpen(
                                                                            true,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Pencil className="mr-2 size-4" />
                                                                    {t(
                                                                        'Edit draft',
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                        {can(
                                                            'tenant.stock_transfer.cancel',
                                                        ) &&
                                                            transfer.status.toLowerCase() !==
                                                                'cancelled' && (
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() =>
                                                                        setTransferToCancel(
                                                                            transfer,
                                                                        )
                                                                    }
                                                                >
                                                                    <XCircle className="mr-2 size-4" />
                                                                    {t(
                                                                        'Batalkan mutasi',
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-14 text-center text-sm text-muted-foreground"
                                        >
                                            {t('empty_transfer_transactions')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <TransactionPagination
                        route={route}
                        filters={filters}
                        currentPage={transfers.current_page}
                        lastPage={transfers.last_page}
                        total={transfers.total}
                    />
                </section>
            </main>

            <TransferDetailModal
                isOpen={!!selectedTransfer}
                onClose={() => setSelectedTransfer(null)}
                transfer={selectedTransfer}
            />

            <CreateTransferModal
                key={editingTransfer?.id ?? 'new-transfer'}
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingTransfer(null);
                }}
                tenantSlug={tenantSlug}
                locations={locations}
                skus={skus}
                initialTransfer={editingTransfer}
            />

            <AlertDialog
                open={!!transferToCancel}
                onOpenChange={(open) => {
                    if (!open) {
                        setTransferToCancel(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('Batalkan mutasi stok?')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {`${t('Dokumen')} ${transferToCancel?.transfer_code ?? ''} ${t('akan dibatalkan. Jika sudah selesai, stok akan dikembalikan ke rak asal setelah saldo tujuan divalidasi.')}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Kembali')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (!transferToCancel) {
                                    return;
                                }

                                router.post(
                                    `${route}/${encodeURIComponent(transferToCancel.transfer_code)}/cancel`,
                                    {},
                                    {
                                        preserveScroll: true,
                                        onError: (errors) =>
                                            toast.error(
                                                Object.values(errors)[0] ??
                                                    t(
                                                        'Mutasi tidak dapat dibatalkan. Periksa stok di rak tujuan.',
                                                    ),
                                            ),
                                    },
                                );
                                setTransferToCancel(null);
                            }}
                        >
                            {t('Ya, batalkan mutasi')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
