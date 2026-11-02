import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Layers, PackageCheck, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';
import type {
    LocationOption,
    SkuOption,
    StockTransferItem,
    StockTransferSummary,
    WarehouseOption,
} from '@/types/stock_transfer';
import { usePermission } from '@/utils/permission';
import {
    TransactionFilterBar,
    transactionStatusLabel,
} from '../components/TransactionFilterBar';
import type { TransactionFilters } from '../components/TransactionFilterBar';
import { TransactionPagination } from '../components/TransactionPagination';
import { CreateTransferModal } from './components/CreateTransferModal';

interface TransferPage {
    data: StockTransferItem[];
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
                        'Kelola relokasi stok internal, replenishment rak penyimpanan, dan mutasi barang antar lokasi gudang.',
                    )}
                    renderAction={
                        can('tenant.stock_transfer.create') ? (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                <Plus className="size-4" />
                                {t('Buat Transfer Stok')}
                            </Button>
                        ) : null
                    }
                />

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(({ label, value, icon: Icon }) => (
                        <article
                            key={label}
                            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm"
                        >
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t(label)}
                                </p>
                                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                                    {value.toLocaleString()}
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

                <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_reference')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_item_summary')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('filter_warehouse_origin')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('filter_warehouse_destination')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_status')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_created_at')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transfers.data.length ? (
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
                                                    {transfer.product_name}
                                                </p>
                                                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                    {transfer.sku_code} ·{' '}
                                                    {t('table_quantity')}{' '}
                                                    {transfer.quantity}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    {transfer.from_warehouse}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {transfer.from_location}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-medium text-foreground">
                                                    {transfer.to_warehouse}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {transfer.to_location}
                                                </p>
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
