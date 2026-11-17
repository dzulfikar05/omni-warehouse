import { useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRightLeft,
    Loader2,
    Plus,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/searchable-select';
import type { SelectOption } from '@/components/searchable-select';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/context/language-context';
import type {
    LocationOption,
    SkuOption,
    StockTransferHeaderItem,
} from '../types/stock_transfer';

interface TransferItemRow {
    row_id: string;
    sku_id: string;
    from_location_id: string;
    to_location_id: string;
    quantity: number;
    batch_number: string | null;
    expiry_date: string | null;
}

interface CreateTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantSlug: string;
    locations: LocationOption[];
    skus: SkuOption[];
    initialTransfer?: StockTransferHeaderItem | null;
}

const rowFromDetail = (
    item: NonNullable<StockTransferHeaderItem['items']>[number],
    index: number,
): TransferItemRow => ({
    row_id: `edit-${item.id}-${index}`,
    sku_id: String(item.sku_id),
    from_location_id: String(item.from_location_id),
    to_location_id: String(item.to_location_id),
    quantity: item.quantity,
    batch_number: item.batch_number,
    expiry_date: item.expiry_date,
});

export function CreateTransferModal({
    isOpen,
    onClose,
    tenantSlug,
    locations,
    skus,
    initialTransfer = null,
}: CreateTransferModalProps) {
    const { t } = useTranslation();
    const [warning, setWarning] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const initialItems = initialTransfer?.items?.map(rowFromDetail) ?? [
        {
            row_id: 'row-1',
            sku_id: '',
            from_location_id: '',
            to_location_id: '',
            quantity: 1,
            batch_number: null,
            expiry_date: null,
        },
    ];
    const {
        data,
        setData,
        post,
        put,
        processing,
        reset,
        clearErrors,
        transform,
    } = useForm<{
        items: TransferItemRow[];
        notes: string;
    }>({
        items: initialItems,
        notes: initialTransfer?.notes ?? '',
    });

    const closeModal = (force = false) => {
        if (processing && !force) {
            return;
        }

        reset();
        clearErrors();
        setWarning(null);
        setIsConfirmOpen(false);
        onClose();
    };

    const rackLabel = (location: LocationOption) =>
        location.zone
            ? `${location.zone} - ${location.rack_code}`
            : location.rack_code;

    const destinationOptions = useMemo<SelectOption[]>(
        () =>
            locations.map((location) => ({
                value: String(location.id),
                label: rackLabel(location),
                sublabel: location.warehouse_name,
            })),
        [locations],
    );

    const skuOptions = useMemo<SelectOption[]>(
        () =>
            skus.map((sku) => ({
                value: String(sku.id),
                label: sku.code,
                sublabel: sku.name,
                badge: `${sku.current_stock.toLocaleString()} pcs`,
            })),
        [skus],
    );

    const getLocationStock = (skuId: string, locationId: string) => {
        const sku = skus.find((option) => String(option.id) === skuId);

        return (
            sku?.locations.find(
                (stock) => String(stock.location_id) === locationId,
            )?.quantity ?? 0
        );
    };

    const getRowAvailableStock = (
        skuId: string,
        locationId: string,
        rowIndex: number,
    ) => {
        if (!skuId || !locationId) {
            return 0;
        }

        const physicalStock = getLocationStock(skuId, locationId);
        const allocatedOnOtherRows = data.items.reduce(
            (total, row, index) =>
                index !== rowIndex &&
                row.sku_id === skuId &&
                row.from_location_id === locationId
                    ? total + Math.max(0, row.quantity)
                    : total,
            0,
        );

        return Math.max(0, physicalStock - allocatedOnOtherRows);
    };

    const updateItem = (
        rowIndex: number,
        key: keyof TransferItemRow,
        value: string | number,
    ) => {
        setWarning(null);
        setData(
            'items',
            data.items.map((row, index) => {
                if (index !== rowIndex) {
                    return row;
                }

                if (key === 'sku_id') {
                    return {
                        ...row,
                        sku_id: String(value),
                        from_location_id: '',
                        to_location_id: '',
                        quantity: 1,
                        batch_number: null,
                        expiry_date: null,
                    };
                }

                const updated = { ...row, [key]: value };

                if (
                    key === 'from_location_id' &&
                    updated.to_location_id === String(value)
                ) {
                    updated.to_location_id = '';
                }

                return updated;
            }),
        );
    };

    const addRow = () => {
        setData('items', [
            ...data.items,
            {
                row_id: `row-${crypto.randomUUID()}`,
                sku_id: '',
                from_location_id: '',
                to_location_id: '',
                quantity: 1,
                batch_number: null,
                expiry_date: null,
            },
        ]);
    };

    const removeRow = (rowIndex: number) => {
        setData(
            'items',
            data.items.filter((_, index) => index !== rowIndex),
        );
    };

    const validate = () => {
        if (data.items.length === 0) {
            setWarning(t('Tambahkan minimal satu baris item mutasi.'));

            return false;
        }

        for (const [index, item] of data.items.entries()) {
            if (
                !item.sku_id ||
                !item.from_location_id ||
                !item.to_location_id
            ) {
                setWarning(
                    `${t('Baris')} ${index + 1}: ${t('pilih SKU, rak asal, dan rak tujuan.')}`,
                );

                return false;
            }

            if (item.from_location_id === item.to_location_id) {
                setWarning(t('Rak asal dan rak tujuan tidak boleh sama.'));

                return false;
            }

            const available = getRowAvailableStock(
                item.sku_id,
                item.from_location_id,
                index,
            );

            if (item.quantity < 1 || item.quantity > available) {
                setWarning(
                    `${t('Baris')} ${index + 1}: ${t('jumlah harus antara 1 dan')} ${available.toLocaleString()} ${t('unit tersedia.')}`,
                );

                return false;
            }
        }

        return true;
    };

    const submit = () => {
        setIsConfirmOpen(false);
        transform((form) => ({
            ...form,
            items: form.items.map((row) => ({
                sku_id: row.sku_id,
                from_location_id: row.from_location_id,
                to_location_id: row.to_location_id,
                quantity: row.quantity,
                batch_number: row.batch_number,
                expiry_date: row.expiry_date,
            })),
        }));

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                closeModal(true);
            },
            onError: (errors: Record<string, string>) => {
                setWarning(Object.values(errors)[0] ?? null);
                toast.error(
                    Object.values(errors)[0] ??
                        t(
                            'Mutasi gagal diproses. Periksa stok dan lokasi rak.',
                        ),
                );
            },
        };

        if (initialTransfer) {
            put(
                `/${tenantSlug}/transactions/stock-transfer/${encodeURIComponent(initialTransfer.transfer_code)}`,
                options,
            );
        } else {
            post(`/${tenantSlug}/transactions/stock-transfer`, options);
        }
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeModal();
                    }
                }}
            >
                <DialogContent className="w-[98vw] max-w-[1600px] overflow-hidden p-0 sm:max-w-[1600px]">
                    <DialogHeader className="border-b border-border bg-muted/40 px-6 py-4">
                        <DialogTitle className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                                <ArrowRightLeft className="size-5" />
                            </span>
                            <span>
                                {initialTransfer
                                    ? t('Edit Draft Mutasi Stok')
                                    : t('Buat Mutasi Stok')}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="pl-[52px]">
                            {t(
                                'Pilih SKU, rak sumber dengan stok tersedia, dan rak tujuan untuk setiap baris batch.',
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (validate()) {
                                setIsConfirmOpen(true);
                            }
                        }}
                        className="max-h-[78vh] space-y-4 overflow-y-auto p-6"
                    >
                        {warning && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                            >
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <span>{warning}</span>
                            </div>
                        )}

                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                                        <th className="w-12 p-3 text-center font-semibold">
                                            #
                                        </th>
                                        <th className="w-[30%] p-3 font-semibold">
                                            {t('Produk / SKU')}
                                        </th>
                                        <th className="w-[24%] p-3 font-semibold">
                                            {t('Rak Asal (Origin)')}
                                        </th>
                                        <th className="w-[24%] p-3 font-semibold">
                                            {t('Rak Tujuan (Dest)')}
                                        </th>
                                        <th className="w-32 p-3 text-center font-semibold">
                                            {t('Qty Unit')}
                                        </th>
                                        <th className="w-16 p-3 text-center font-semibold">
                                            {t('Aksi')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.items.map((row, index) => {
                                        const sku = skus.find(
                                            (option) =>
                                                String(option.id) ===
                                                row.sku_id,
                                        );
                                        const available = getRowAvailableStock(
                                            row.sku_id,
                                            row.from_location_id,
                                            index,
                                        );
                                        const originOptions: SelectOption[] =
                                            sku?.locations.flatMap(
                                                (stock): SelectOption[] => {
                                                    const location =
                                                        locations.find(
                                                            (option) =>
                                                                option.id ===
                                                                stock.location_id,
                                                        );
                                                    const quantity =
                                                        getRowAvailableStock(
                                                            row.sku_id,
                                                            String(
                                                                stock.location_id,
                                                            ),
                                                            index,
                                                        );

                                                    if (
                                                        !location ||
                                                        quantity <= 0
                                                    ) {
                                                        return [];
                                                    }

                                                    return [
                                                        {
                                                            value: String(
                                                                location.id,
                                                            ),
                                                            label: rackLabel(
                                                                location,
                                                            ),
                                                            sublabel:
                                                                location.warehouse_name,
                                                            badge: `${quantity.toLocaleString()} pcs`,
                                                        },
                                                    ];
                                                },
                                            ) ?? [];
                                        const targetOptions =
                                            destinationOptions.filter(
                                                (option) =>
                                                    option.value !==
                                                    row.from_location_id,
                                            );

                                        return (
                                            <tr
                                                key={row.row_id}
                                                className="align-middle hover:bg-muted/20"
                                            >
                                                <td className="p-3 text-center font-mono text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="p-3">
                                                    <SearchableSelect
                                                        options={skuOptions}
                                                        value={row.sku_id}
                                                        onSelect={(value) =>
                                                            updateItem(
                                                                index,
                                                                'sku_id',
                                                                value,
                                                            )
                                                        }
                                                        placeholder={t(
                                                            'Pilih SKU',
                                                        )}
                                                        searchPlaceholder={t(
                                                            'Cari kode SKU atau produk',
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <SearchableSelect
                                                        options={originOptions}
                                                        value={
                                                            row.from_location_id
                                                        }
                                                        onSelect={(value) =>
                                                            updateItem(
                                                                index,
                                                                'from_location_id',
                                                                value,
                                                            )
                                                        }
                                                        placeholder={t(
                                                            'Pilih rak asal',
                                                        )}
                                                        searchPlaceholder={t(
                                                            'Cari kode rak asal',
                                                        )}
                                                        disabled={!sku}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <SearchableSelect
                                                        options={targetOptions}
                                                        value={
                                                            row.to_location_id
                                                        }
                                                        onSelect={(value) =>
                                                            updateItem(
                                                                index,
                                                                'to_location_id',
                                                                value,
                                                            )
                                                        }
                                                        placeholder={t(
                                                            'Pilih rak tujuan',
                                                        )}
                                                        searchPlaceholder={t(
                                                            'Cari kode rak tujuan',
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <Input
                                                        aria-label={`${t('Qty Unit baris')} ${index + 1}`}
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        max={available}
                                                        value={row.quantity}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                'quantity',
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="text-center font-mono"
                                                    />
                                                    <p className="mt-1 text-center text-xs text-muted-foreground">
                                                        {t('tersedia')}:{' '}
                                                        {available.toLocaleString()}
                                                    </p>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={
                                                            data.items.length <=
                                                            1
                                                        }
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        aria-label={`${t('Hapus baris')} ${index + 1}`}
                                                        onClick={() =>
                                                            removeRow(index)
                                                        }
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addRow}
                            className="w-full border-dashed"
                        >
                            <Plus className="size-4" />
                            {t('Tambah Baris Item Mutasi Baru')}
                        </Button>

                        <div className="space-y-2">
                            <Label htmlFor="transfer-notes">
                                {t('Catatan Mutasi')}
                            </Label>
                            <Textarea
                                id="transfer-notes"
                                value={data.notes}
                                maxLength={2000}
                                onChange={(event) =>
                                    setData('notes', event.target.value)
                                }
                                placeholder={t('Catatan untuk dokumen mutasi')}
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => closeModal()}
                                disabled={processing}
                            >
                                {t('Batal')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || skus.length === 0}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {processing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <ArrowRightLeft className="size-4" />
                                )}
                                {initialTransfer
                                    ? t('Simpan draft')
                                    : t('Proses mutasi batch')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('Konfirmasi mutasi batch')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {`${t('Mutasi')} ${data.items.length} ${t('baris item akan memperbarui stok rak sumber dan tujuan secara atomik.')}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Kembali')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={submit}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <ArrowRightLeft className="size-4" />
                            )}
                            {initialTransfer
                                ? t('Simpan')
                                : t('Ya, proses mutasi')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
