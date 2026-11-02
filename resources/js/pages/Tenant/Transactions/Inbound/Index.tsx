import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Package, Plus, Warehouse } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import {
    TransactionFilterBar,
    transactionStatusLabel,
} from '../components/TransactionFilterBar';
import type { TransactionFilters } from '../components/TransactionFilterBar';
import { TransactionPagination } from '../components/TransactionPagination';
import { CreateManifestModal } from './components/CreateManifestModal';

interface ManifestItem {
    manifest_code: string;
    status: string;
    supplier_name: string;
    created_by: string;
    created_at: string;
    total_skus: number;
    total_units: number;
}

interface TransactionPage<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

interface SupplierOption {
    id: number;
    name: string;
}

interface InboundIndexProps {
    manifests: TransactionPage<ManifestItem>;
    summary: {
        total: number;
        pending: number;
        completed: number;
        total_units: number;
    };
    statuses: string[];
    suppliers: SupplierOption[];
    filters: Partial<TransactionFilters>;
}

export default function Index({
    manifests,
    summary,
    statuses,
    suppliers,
    filters,
}: InboundIndexProps) {
    const { t, locale } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const currentPathSlug =
        typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : '';
    const tenantSlug =
        current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;
    const route = `/${tenantSlug}/transactions/inbound`;

    const stats = [
        {
            label: 'stat_total_transactions',
            value: summary.total,
            icon: Package,
        },
        {
            label: 'stat_pending_transactions',
            value: summary.pending,
            icon: Clock,
        },
        {
            label: 'stat_completed_transactions',
            value: summary.completed,
            icon: CheckCircle2,
        },
        {
            label: 'stat_total_units',
            value: summary.total_units,
            icon: Warehouse,
        },
    ];

    return (
        <>
            <Head title={t('page_inbound_transactions')} />
            <main className="space-y-6 p-4 font-sans sm:p-6">
                <PageHeader
                    title={t('page_inbound_transactions')}
                    description={t(
                        'Kelola transaksi penerimaan PO, alokasi unloading dock, dan verifikasi bongkar muat gudang.',
                    )}
                    renderAction={
                        can('tenant.inbound.create') ? (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                <Plus className="size-4" />
                                {t('Inisiasi Penerimaan PO')}
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
                    kind="inbound"
                    filters={filters}
                    statuses={statuses}
                    suppliers={suppliers}
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
                                        {t('table_supplier')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_item_summary')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_status')}
                                    </th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">
                                        {t('table_created_at')}
                                    </th>
                                    <th className="px-5 py-3.5 text-right whitespace-nowrap">
                                        {t('table_action')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {manifests.data.length ? (
                                    manifests.data.map((manifest) => (
                                        <tr
                                            key={manifest.manifest_code}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">
                                                {manifest.manifest_code}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-foreground">
                                                {manifest.supplier_name}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-muted-foreground">
                                                {manifest.total_skus}{' '}
                                                {t('table_skus')} ·{' '}
                                                {manifest.total_units}{' '}
                                                {t('table_units')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                                    {transactionStatusLabel(
                                                        manifest.status,
                                                        t,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(
                                                    manifest.created_at,
                                                ).toLocaleString(
                                                    locale === 'id'
                                                        ? 'id-ID'
                                                        : 'en-US',
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-border"
                                                >
                                                    <Link
                                                        href={`${route}/${manifest.manifest_code}`}
                                                    >
                                                        {t(
                                                            'btn_view_transaction',
                                                        )}
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-14 text-center text-sm text-muted-foreground"
                                        >
                                            {t('empty_inbound_transactions')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TransactionPagination
                        route={route}
                        filters={filters}
                        currentPage={manifests.current_page}
                        lastPage={manifests.last_page}
                        total={manifests.total}
                    />
                </section>
            </main>
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
        { title: 'Inbound Management', href: '#' },
    ],
};
