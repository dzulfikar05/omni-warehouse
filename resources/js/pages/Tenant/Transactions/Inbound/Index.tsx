import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Package, Plus, Warehouse, Eye } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
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

interface MasterSkuOption {
    id: number;
    sku: string;
    product_name: string;
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
    masterSkus: MasterSkuOption[];
    filters: Partial<TransactionFilters>;
}

export default function Index({
    manifests,
    summary,
    statuses,
    suppliers,
    masterSkus,
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

                {/* Stat Cards */}
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

                {/* Filter Bar */}
                <TransactionFilterBar
                    route={route}
                    kind="inbound"
                    filters={filters}
                    statuses={statuses}
                    suppliers={suppliers}
                />

                {/* Standardized Table Section */}
                <section className="rounded-lg bg-card text-card-foreground shadow-md border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                                    <th className="p-4 font-semibold whitespace-nowrap">
                                        {t('table_reference')}
                                    </th>
                                    <th className="p-4 font-semibold whitespace-nowrap">
                                        {t('table_supplier')}
                                    </th>
                                    <th className="p-4 font-semibold whitespace-nowrap">
                                        {t('table_item_summary')}
                                    </th>
                                    <th className="p-4 font-semibold whitespace-nowrap">
                                        {t('table_status')}
                                    </th>
                                    <th className="p-4 font-semibold whitespace-nowrap">
                                        {t('table_created_at')}
                                    </th>
                                    {can('tenant.inbound.show') && (
                                        <th className="p-4 font-semibold text-right whitespace-nowrap">
                                            {t('Actions')}
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {manifests.data.length ? (
                                    manifests.data.map((manifest) => (
                                        <tr
                                            key={manifest.manifest_code}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="p-4 font-mono font-semibold text-primary">
                                                {manifest.manifest_code}
                                            </td>
                                            <td className="p-4 font-medium text-foreground">
                                                {manifest.supplier_name}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {manifest.total_skus}{' '}
                                                {t('table_skus')} ·{' '}
                                                {manifest.total_units}{' '}
                                                {t('table_units')}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                                    {transactionStatusLabel(
                                                        manifest.status,
                                                        t,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(
                                                    manifest.created_at,
                                                ).toLocaleString(
                                                    locale === 'id'
                                                        ? 'id-ID'
                                                        : 'en-US',
                                                )}
                                            </td>
                                            {can('tenant.inbound.show') && (
                                                <td className="p-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                {t('Actions')}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`${route}/${manifest.manifest_code}`}
                                                                    className="flex items-center cursor-pointer"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                    <span>{t('View Details')}</span>
                                                                </Link>
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
                                            colSpan={can('tenant.inbound.show') ? 6 : 5}
                                            className="p-6 text-center text-muted-foreground"
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

            {can('tenant.inbound.create') && (
                <CreateManifestModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    suppliers={suppliers}
                    masterSkus={masterSkus}
                />
            )}
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Transaction', href: '#' },
        { title: 'Inbound Management', href: '#' },
    ],
};
