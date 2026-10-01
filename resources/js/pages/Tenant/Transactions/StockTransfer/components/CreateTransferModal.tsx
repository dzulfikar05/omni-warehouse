import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, AlertCircle, Loader2, Package, ArrowRight, Plus, Trash2, AlertTriangle, Layers } from 'lucide-react';
import { LocationOption, SkuOption, WarehouseOption } from '@/types/stock_transfer';

interface TransferItemRow {
    id: string;
    sku_id: string;
    from_location_id: string;
    to_location_id: string;
    quantity: number;
}

interface CreateTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantSlug: string;
    warehouses: WarehouseOption[];
    locations: LocationOption[];
    skus: SkuOption[];
}

export const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
    isOpen,
    onClose,
    tenantSlug,
    locations,
    skus,
}) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        items: [
            {
                id: 'row-1',
                sku_id: '',
                from_location_id: '',
                to_location_id: '',
                quantity: 1,
            },
        ] as TransferItemRow[],
        notes: '',
    });

    const [warning, setWarning] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

    // Helper: Add new item row
    const handleAddItem = () => {
        setWarning(null);
        setData('items', [
            ...data.items,
            {
                id: `row-${Date.now()}`,
                sku_id: '',
                from_location_id: '',
                to_location_id: '',
                quantity: 1,
            },
        ]);
    };

    // Helper: Remove item row
    const handleRemoveItem = (index: number) => {
        if (data.items.length <= 1) {
            setWarning('Minimal harus ada 1 item barang yang dipindahkan!');
            return;
        }
        setWarning(null);
        const updated = [...data.items];
        updated.splice(index, 1);
        setData('items', updated);
    };

    // Helper: Update specific row field
    const handleItemChange = (index: number, field: keyof TransferItemRow, value: any) => {
        setWarning(null);
        const updated = [...data.items];
        const row = { ...updated[index], [field]: value };

        // Smart auto-select from_location when SKU is picked
        if (field === 'sku_id') {
            const selectedSku = skus.find((s) => String(s.id) === String(value));
            if (selectedSku?.locations?.length) {
                row.from_location_id = String(selectedSku.locations[0].location_id);
                if (row.to_location_id === row.from_location_id) {
                    row.to_location_id = '';
                }
            } else {
                row.from_location_id = '';
            }
        }

        updated[index] = row;
        setData('items', updated);
    };

    // Helper: Check if quantity exceeds stock at origin rack for a row
    const getRowAvailableStock = (skuId: string, fromLocId: string) => {
        if (!skuId || !fromLocId) return 0;
        const sku = skus.find((s) => String(s.id) === String(skuId));
        if (!sku || !sku.locations) return 0;
        const loc = sku.locations.find((l) => String(l.location_id) === String(fromLocId));
        return loc ? loc.quantity : 0;
    };

    // Form submission validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setWarning(null);

        if (data.items.length === 0) {
            setWarning('Silakan tambahkan minimal 1 item barang!');
            return;
        }

        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            if (!item.sku_id) {
                setWarning(`Baris ke-${i + 1}: Silakan pilih Produk / SKU!`);
                return;
            }
            if (!item.from_location_id) {
                setWarning(`Baris ke-${i + 1}: Silakan pilih Rak Asal (Origin)!`);
                return;
            }
            if (!item.to_location_id) {
                setWarning(`Baris ke-${i + 1}: Silakan pilih Rak Tujuan (Destination)!`);
                return;
            }
            if (item.from_location_id === item.to_location_id) {
                setWarning(`Baris ke-${i + 1}: Rak Asal dan Rak Tujuan tidak boleh sama!`);
                return;
            }

            const available = getRowAvailableStock(item.sku_id, item.from_location_id);
            if (item.quantity > available) {
                const sku = skus.find((s) => String(s.id) === String(item.sku_id));
                setWarning(
                    `Baris ke-${i + 1} (${sku?.name || 'SKU'}): Jumlah unit (${item.quantity}) melebihi stok yang tersedia di rak asal (${available} pcs)!`
                );
                return;
            }
        }

        setIsConfirmOpen(true);
    };

    const executeTransfer = () => {
        post(`/${tenantSlug}/transactions/stock-transfer`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsConfirmOpen(false);
                reset();
                onClose();
            },
            onError: () => {
                setIsConfirmOpen(false);
            },
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-full max-w-3xl sm:max-w-4xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-0 overflow-hidden font-sans text-stone-900 dark:text-stone-100">
                    {/* Header */}
                    <div className="px-6 py-4.5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/70 flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-3 text-sm font-bold text-stone-900 dark:text-stone-100">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                                <Layers className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold leading-tight">Buat Mutasi Transfer Stok</h3>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">Mendukung mutasi 1 barang maupun batch multi-item sekaligus</p>
                            </div>
                        </DialogTitle>
                        <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mr-8">
                            {data.items.length} {data.items.length === 1 ? 'Item' : 'Batch Items'}
                        </span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                        {warning && (
                            <div className="flex items-start gap-2.5 p-3.5 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                                <span>{warning}</span>
                            </div>
                        )}

                        {/* Items Rows Table / Cards */}
                        <div className="space-y-4">
                            {data.items.map((rowItem, index) => {
                                const selectedSku = skus.find((s) => String(s.id) === String(rowItem.sku_id));
                                const availableStock = getRowAvailableStock(rowItem.sku_id, rowItem.from_location_id);
                                const isExceeding = rowItem.quantity > availableStock && !!rowItem.from_location_id;

                                // Filter available origin locations for this SKU
                                const originOptions = selectedSku?.locations
                                    ? selectedSku.locations.map((loc) => {
                                          const detail = locations.find((l) => l.id === loc.location_id);
                                          return {
                                              ...loc,
                                              code: detail?.code || `LOC-${loc.location_id}`,
                                              name: detail?.name || 'Zone',
                                          };
                                      })
                                    : [];

                                // Filter destination locations (exclude origin)
                                const destOptions = locations.filter((loc) => String(loc.id) !== rowItem.from_location_id);

                                return (
                                    <div
                                        key={rowItem.id}
                                        className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 space-y-3 relative group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono">
                                                    {index + 1}
                                                </span>
                                                Item Mutasi #{index + 1}
                                            </span>

                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Hapus</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                                            {/* Select SKU (Col 5) */}
                                            <div className="lg:col-span-5 space-y-1">
                                                <Label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                                    Pilih Produk / SKU <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select
                                                    value={rowItem.sku_id}
                                                    onValueChange={(val) => handleItemChange(index, 'sku_id', val)}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl h-9 px-3 text-xs text-stone-900 dark:text-stone-100 cursor-pointer">
                                                        <SelectValue placeholder="Pilih SKU barang..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-h-56">
                                                        {skus.map((sku) => (
                                                            <SelectItem key={sku.id} value={String(sku.id)} className="text-xs">
                                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{sku.code}</span> — {sku.name} (Stok: {sku.current_stock})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Select Origin Location (Col 3) */}
                                            <div className="lg:col-span-3 space-y-1">
                                                <Label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                                    Rak Asal <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select
                                                    value={rowItem.from_location_id}
                                                    onValueChange={(val) => handleItemChange(index, 'from_location_id', val)}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl h-9 px-3 text-xs text-stone-900 dark:text-stone-100 cursor-pointer">
                                                        <SelectValue placeholder="Pilih Rak Asal..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-h-48">
                                                        {originOptions.length > 0 ? (
                                                            originOptions.map((loc) => (
                                                                <SelectItem key={loc.location_id} value={String(loc.location_id)} className="text-xs">
                                                                    <span className="font-mono font-bold">{loc.code}</span> — Stok: {loc.quantity}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="p-2 text-xs text-stone-500">Pilih SKU yang memiliki stok dahulu.</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Select Destination Location (Col 3) */}
                                            <div className="lg:col-span-3 space-y-1">
                                                <Label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                                    Rak Tujuan <span className="text-rose-500">*</span>
                                                </Label>
                                                <Select
                                                    value={rowItem.to_location_id}
                                                    onValueChange={(val) => handleItemChange(index, 'to_location_id', val)}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl h-9 px-3 text-xs text-stone-900 dark:text-stone-100 cursor-pointer">
                                                        <SelectValue placeholder="Pilih Rak Tujuan..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 max-h-48">
                                                        {destOptions.map((loc) => (
                                                            <SelectItem key={loc.id} value={String(loc.id)} className="text-xs">
                                                                <span className="font-mono font-bold">{loc.code}</span> ({loc.name})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Quantity Input (Col 1) */}
                                            <div className="lg:col-span-1 space-y-1">
                                                <Label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                                    Qty <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={availableStock || 9999}
                                                    value={rowItem.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className={`h-9 px-2 text-center text-xs font-mono font-bold bg-white dark:bg-stone-900 border rounded-xl ${
                                                        isExceeding ? 'border-rose-500 text-rose-600' : 'border-stone-200 dark:border-stone-700'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Row Warnings / Available Stock Info & Route Badge */}
                                        {rowItem.sku_id && rowItem.from_location_id && (
                                            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200/60 dark:border-stone-800/60">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-stone-500 dark:text-stone-400 font-mono">
                                                        Stok Tersedia: <strong className="text-blue-600 dark:text-blue-400 font-bold">{availableStock} pcs</strong>
                                                    </span>
                                                    {rowItem.to_location_id && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-200/60 dark:bg-stone-800 text-[10px] font-mono font-semibold text-stone-700 dark:text-stone-300">
                                                            <span>{originOptions.find(o => String(o.location_id) === rowItem.from_location_id)?.code}</span>
                                                            <ArrowRight className="w-2.5 h-2.5 text-stone-400" />
                                                            <span className="text-blue-600 dark:text-blue-400">{destOptions.find(d => String(d.id) === rowItem.to_location_id)?.code}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                {isExceeding && (
                                                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Qty melebihi stok rak asal!
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Row Button */}
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full py-2.5 rounded-xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Item Baru ke Batch Mutasi</span>
                        </button>

                        {/* Notes */}
                        <div className="space-y-1.5 pt-2">
                            <Label htmlFor="notes" className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                                Catatan / Alasan Transfer Batch (Opsional)
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Contoh: Replenishment rak picking bulanan untuk seluruh barang snack..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 min-h-[60px] focus:border-blue-600"
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={processing}
                                className="h-10 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/30 transition-all border-0 cursor-pointer disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-4 h-4" />
                                        <span>Proses Mutasi Batch ({data.items.length} SKU)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Konfirmasi Mutasi Batch */}
            <AlertDialog open={isConfirmOpen} onOpenChange={(open) => { if (!processing) setIsConfirmOpen(open); }}>
                <AlertDialogContent className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-0 overflow-hidden font-sans gap-0">
                    <div className="px-6 pt-6 pb-5 border-b border-stone-100 dark:border-stone-800">
                        <AlertDialogHeader className="gap-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <AlertDialogTitle className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
                                        Konfirmasi Relokasi Batch ({data.items.length} SKU)
                                    </AlertDialogTitle>
                                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Semua pergerakan stok akan diproses dalam satu dokumen transaksi.</p>
                                </div>
                            </div>
                        </AlertDialogHeader>
                    </div>

                    <div className="px-6 py-4 space-y-2 max-h-60 overflow-y-auto">
                        {data.items.map((item, idx) => {
                            const sku = skus.find((s) => String(s.id) === String(item.sku_id));
                            const fromLoc = locations.find((l) => String(l.id) === String(item.from_location_id));
                            const toLoc = locations.find((l) => String(l.id) === String(item.to_location_id));

                            return (
                                <div key={item.id} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between text-xs">
                                    <div className="min-w-0 flex-1 pr-2">
                                        <p className="font-bold text-stone-800 dark:text-stone-200 truncate">{sku?.name}</p>
                                        <p className="text-[10px] font-mono text-stone-400">{sku?.code}</p>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                                        <span className="font-bold text-stone-600 dark:text-stone-400">{fromLoc?.code}</span>
                                        <ArrowRight className="w-3 h-3 text-stone-400" />
                                        <span className="font-bold text-blue-600 dark:text-blue-400">{toLoc?.code}</span>
                                        <span className="ml-2 font-black text-xs text-stone-900 dark:text-stone-100 bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded">
                                            {item.quantity} pcs
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800">
                        <AlertDialogDescription className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                            Pastikan fisik seluruh barang yang terdaftar di atas sudah diverifikasi oleh operator. Eksekusi batch transfer sekarang?
                        </AlertDialogDescription>
                    </div>

                    <AlertDialogFooter className="px-6 py-4 flex flex-row items-center gap-2.5">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 h-10 rounded-xl font-semibold text-xs border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => executeTransfer()}
                            disabled={processing}
                            className="flex-1 h-10 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm shadow-blue-500/30 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                    <span>Eksekusi Batch Mutasi</span>
                                </>
                            )}
                        </button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

