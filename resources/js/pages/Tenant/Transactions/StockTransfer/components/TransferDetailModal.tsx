import { ArrowRight, CalendarDays, FileText, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/context/language-context';
import { transactionStatusLabel } from '../../components/TransactionFilterBar';
import type { StockTransferHeaderItem } from '../types/stock_transfer';

interface TransferDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transfer: StockTransferHeaderItem | null;
}

export function TransferDetailModal({
    isOpen,
    onClose,
    transfer,
}: TransferDetailModalProps) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={isOpen && !!transfer}
            onOpenChange={(open) => !open && onClose()}
        >
            {transfer && (
                <DialogContent className="w-[98vw] max-w-[1600px] overflow-hidden p-0 sm:max-w-[1600px]">
                    <DialogHeader className="border-b border-border bg-muted/40 px-6 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-3 pr-7">
                            <div>
                                <DialogTitle>
                                    {t('Rincian Mutasi Stok')}
                                </DialogTitle>
                                <DialogDescription className="mt-1 font-mono">
                                    {transfer.transfer_code}
                                </DialogDescription>
                            </div>
                            <span className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium">
                                {transactionStatusLabel(transfer.status, t)}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="max-h-[72vh] space-y-5 overflow-y-auto p-6">
                        <section
                            aria-label={t('Informasi dokumen')}
                            className="grid gap-3 sm:grid-cols-3"
                        >
                            <div className="flex items-center gap-3 rounded-md border border-border p-3">
                                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {t('Tanggal dibuat')}
                                    </p>
                                    <p className="truncate text-sm font-medium">
                                        {transfer.created_at}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-md border border-border p-3">
                                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        {t('Dibuat oleh')}
                                    </p>
                                    <p className="truncate text-sm font-medium">
                                        {transfer.created_by_name ||
                                            t('Tidak diketahui')}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-md border border-border p-3">
                                <p className="text-xs text-muted-foreground">
                                    {t('Total item mutasi')}
                                </p>
                                <p className="text-sm font-medium">
                                    {transfer.total_skus} {t('SKU')} ·{' '}
                                    {transfer.total_quantity.toLocaleString()}{' '}
                                    {t('unit')}
                                </p>
                            </div>
                        </section>

                        <section
                            aria-label={t('Audit dokumen')}
                            className="rounded-lg border border-border p-4"
                        >
                            <h3 className="mb-3 text-sm font-semibold">
                                {t('Audit dokumen')}
                            </h3>
                            <ol className="space-y-2 border-l border-border pl-4 text-sm">
                                <li>
                                    <p className="font-medium">
                                        {t('Dokumen dibuat oleh')}{' '}
                                        {transfer.created_by_name ||
                                            t('Tidak diketahui')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {transfer.created_at}
                                    </p>
                                </li>
                                {transfer.updated_at !==
                                    transfer.created_at && (
                                    <li>
                                        <p className="font-medium">
                                            {t('Dokumen terakhir diperbarui')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {transfer.updated_at}
                                        </p>
                                    </li>
                                )}
                            </ol>
                        </section>

                        <section className="space-y-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <h3 className="text-sm font-semibold">
                                    {t('Rincian pergerakan stok')}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {transfer.items?.length ?? 0}{' '}
                                    {t('baris batch')}
                                </span>
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full min-w-[780px] text-left text-sm">
                                    <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Produk / SKU')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Pergerakan rak')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Batch / Lot')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Qty')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transfer.items?.length ? (
                                            transfer.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {item.sku_code}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="font-medium">
                                                                {item.from_rack}
                                                            </span>
                                                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="font-medium text-primary">
                                                                {item.to_rack}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <p>
                                                            {item.batch_number ||
                                                                '—'}
                                                        </p>
                                                        {item.expiry_date && (
                                                            <p className="mt-0.5 text-muted-foreground">
                                                                {t(
                                                                    'Kedaluwarsa',
                                                                )}
                                                                :{' '}
                                                                {
                                                                    item.expiry_date
                                                                }
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono font-semibold">
                                                        {item.quantity.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                                                >
                                                    {t(
                                                        'Rincian item tidak tersedia.',
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {transfer.notes && (
                            <section className="rounded-lg border border-border bg-muted/20 p-4">
                                <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="size-4 text-muted-foreground" />
                                    {t('Catatan mutasi')}
                                </h3>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                    {transfer.notes}
                                </p>
                            </section>
                        )}
                    </div>

                    <div className="flex justify-end border-t border-border bg-muted/30 px-6 py-3">
                        <Button variant="outline" onClick={onClose}>
                            {t('Tutup')}
                        </Button>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}
