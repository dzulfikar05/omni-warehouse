import React, { useState, useEffect } from 'react';
import { Package, X, HelpCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/context/language-context';
import { ReconciliationItem } from '@/types/stock-opname';

interface VerificationModalProps {
    isOpen: boolean;
    item: ReconciliationItem | null;
    onClose: () => void;
    onSaveSuccess: (updatedItem: ReconciliationItem) => void;
}

export function VerificationModal({ isOpen, item, onClose, onSaveSuccess }: VerificationModalProps) {
    const { t } = useTranslation();
    const [physicalQty, setPhysicalQty] = useState<number>(0);
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        if (item) {
            setPhysicalQty(item.physical_qty);
            setNotes(item.notes || '');
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const systemQty = item.system_qty;
    const delta = physicalQty - systemQty;

    const quickAdd = (val: number) => {
        setPhysicalQty((prev) => Math.max(0, prev + val));
    };

    const handleSave = () => {
        const variance = physicalQty - systemQty;
        const status = variance === 0 ? 'Match' : variance < 0 ? 'Defisit' : 'Surplus';

        onSaveSuccess({
            ...item,
            physical_qty: physicalQty,
            variance,
            status,
            notes,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-card-foreground">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <h2 className="text-sm font-bold text-foreground">{t("Blind Count - Input Fisik Barang")}</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {t("Input jumlah riil yang ada di rak tanpa asumsi sistem")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4 text-xs">
                    <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-blue-600 flex-shrink-0 shadow-2xs">
                            <Package className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                                    {item.sku}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-foreground bg-background border border-border px-2 py-0.5 rounded-lg">
                                    {t("Rak:")}{' '}{item.rack}
                                </span>
                            </div>
                            <h4 className="font-bold text-foreground text-sm mt-1 truncate">{item.name}</h4>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono mt-1">
                                <span>{item.barcode}</span>
                                <span>{t("•")}</span>
                                <span>{item.batch}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="font-semibold text-foreground flex items-center justify-between">
                            <span>
                                {t("Hitungan Fisik Terhitung di Rak")}{' '}<span className="text-red-500">{t("*")}</span>
                            </span>
                            <span className="text-muted-foreground text-[11px] font-mono">
                                {t("Buku:")}{' '}<span className="font-bold text-foreground">{systemQty}</span> {item.unit}
                            </span>
                        </Label>

                        <div className="relative">
                            <Input
                                type="number"
                                value={physicalQty}
                                onChange={(e) => setPhysicalQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full h-12 bg-background border-2 border-border focus:border-blue-600 rounded-xl text-center font-mono font-bold text-2xl text-foreground outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground font-bold">
                                {item.unit}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-1 font-mono">
                            <Button type="button" variant="outline" onClick={() => quickAdd(1)} className="h-8 rounded-xl border-border text-xs font-bold">{t("+1")}</Button>
                            <Button type="button" variant="outline" onClick={() => quickAdd(5)} className="h-8 rounded-xl border-border text-xs font-bold">{t("+5")}</Button>
                            <Button type="button" variant="outline" onClick={() => quickAdd(10)} className="h-8 rounded-xl border-border text-xs font-bold">{t("+10")}</Button>
                            <Button type="button" variant="outline" onClick={() => quickAdd(50)} className="h-8 rounded-xl border-border text-xs font-bold">{t("+50")}</Button>
                        </div>
                    </div>

                    <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between font-mono">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">
                                {delta === 0 ? t("Fisik Sesuai Buku (0 Selisih)") : delta < 0 ? `Defisit (${delta} ${item.unit})` : `Surplus (+${delta} ${item.unit})`}
                            </span>
                        </div>
                        <span
                            className={`font-bold text-xs px-2 py-0.5 rounded-lg ${
                                delta === 0
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                                    : delta < 0
                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200'
                                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200'
                            }`}
                        >
                            {delta > 0 ? `+${delta}` : delta} {item.unit}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label className="font-semibold text-foreground">{t("Catatan Kondisi Rak")}</Label>
                        <Input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t("Cth: Ditemukan 2 kardus basah, atau salah tumpuk...")}
                            className="h-9 text-xs rounded-xl border-border bg-background"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-mono">{t("[Enter] Simpan")}</span>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={onClose} className="h-9 px-4 rounded-xl border-border text-xs">
                            {t("Batal")}</Button>
                        <Button type="button" onClick={handleSave} className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                            <span>{t("Simpan Hasil Hitung")}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
