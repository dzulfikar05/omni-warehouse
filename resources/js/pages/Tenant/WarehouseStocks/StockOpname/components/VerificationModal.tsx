import { Check, Package, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/context/language-context';
import type { ReconciliationItem } from '@/types/stock-opname';

interface VerificationModalProps {
    isOpen: boolean;
    item: ReconciliationItem | null;
    onClose: () => void;
    onSaveSuccess: (updatedItem: ReconciliationItem) => void;
}

export function VerificationModal({ isOpen, item, onClose, onSaveSuccess }: VerificationModalProps) {
    const { t } = useTranslation();
    const [physicalQty, setPhysicalQty] = useState(item?.physical_qty ?? 0);
    const [notes, setNotes] = useState(item?.notes || '');

    if (!isOpen || !item) {
return null;
}

    const delta = physicalQty - item.system_qty;
    const handleSave = () => {
        onSaveSuccess({
            ...item,
            physical_qty: physicalQty,
            variance: delta,
            status: delta === 0 ? 'Match' : delta < 0 ? 'Defisit' : 'Surplus',
            is_counted: true,
            notes,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="verify-opname-title"
                className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 id="verify-opname-title" className="truncate font-semibold">{item.name}</h2>
                            <p className="font-mono text-xs text-muted-foreground">{item.sku} · {item.rack}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('Tutup')}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="space-y-5 p-5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('Stok sistem')}</span>
                        <span className="font-medium tabular-nums">{item.system_qty} {item.unit}</span>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="physical-qty">{t('Jumlah fisik')}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="physical-qty"
                                type="number"
                                min={0}
                                step={1}
                                value={physicalQty}
                                onChange={(event) => setPhysicalQty(Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
                                className="h-12 text-center text-xl font-semibold tabular-nums"
                                autoFocus
                            />
                            <span className="min-w-12 text-sm text-muted-foreground">{item.unit}</span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 5, 10].map((amount) => (
                                <Button
                                    key={amount}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPhysicalQty((current) => current + amount)}
                                >
                                    +{amount}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{t('Selisih')}: </span>
                        <span className={`font-semibold tabular-nums ${delta < 0 ? 'text-rose-600 dark:text-rose-400' : delta > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {delta > 0 ? '+' : ''}{delta} {item.unit}
                        </span>
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="count-notes">{t('Catatan')} <span className="font-normal text-muted-foreground">({t('opsional')})</span></Label>
                        <Input
                            id="count-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            maxLength={1000}
                        />
                    </div>
                </div>

                <footer className="flex justify-end gap-2 border-t border-border px-5 py-4">
                    <Button type="button" variant="outline" onClick={onClose}>{t('Batal')}</Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
                    >
                        <Check className="mr-1.5 h-4 w-4" /> {t('Simpan hitungan')}
                    </Button>
                </footer>
            </section>
        </div>
    );
}
