import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, X, PackageCheck, AlertTriangle, Layers } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import type { InboundItem } from '@/types/inbound';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationOption {
    id: number;
    rack_code: string;
    zone?: string;
}

interface PutawayModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InboundItem | null;
    locations?: LocationOption[];
    onSave: (goodQty: number, damagedQty: number, rack: string, note: string) => void;
}

export const PutawayModal: React.FC<PutawayModalProps> = ({
    isOpen,
    onClose,
    item,
    locations = [],
    onSave,
}) => {
    const { t } = useTranslation();
    const [goodQty, setGoodQty] = useState<number>(0);
    const [damagedQty, setDamagedQty] = useState<number>(0);
    const [selectedRack, setSelectedRack] = useState<string>('');
    const [damageNote, setDamageNote] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (item) {
            setGoodQty(item.good_qty);
            setDamagedQty(item.damaged_qty);
            const defaultRack =
                item.target_rack && item.target_rack !== 'Belum Dialokasi'
                    ? item.target_rack
                    : locations[0]?.rack_code || '';
            setSelectedRack(defaultRack);
            setDamageNote(item.damage_note || '');
            setValidationError(null);
        }
    }, [item, locations]);

    if (!isOpen || !item) return null;

    const handleGoodQtyChange = (val: string) => {
        const parsed = Math.max(0, parseInt(val, 10) || 0);
        setGoodQty(parsed);
        setValidationError(null);
    };

    const handleDamagedQtyChange = (val: string) => {
        const parsed = Math.max(0, parseInt(val, 10) || 0);
        setDamagedQty(parsed);
        setValidationError(null);
    };

    const handleSave = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (damagedQty > 0 && !damageNote.trim()) {
            setValidationError(t('Catatan kerusakan wajib diisi jika terdapat barang cacat/rusak.'));
            return;
        }

        if (goodQty > 0 && !selectedRack) {
            setValidationError(t('Pilih rak penyimpanan untuk barang kondisi baik.'));
            return;
        }

        onSave(goodQty, damagedQty, selectedRack, damageNote);
    };

    const totalInput = goodQty + damagedQty;
    const isOverReceiving = totalInput > item.po_qty;
    const isUnderReceiving = totalInput < item.po_qty && totalInput > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-card text-card-foreground border border-border rounded-lg w-full max-w-lg shadow-xl overflow-hidden flex flex-col text-xs">
                {/* Modal Header */}
                <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="text-xs font-bold text-foreground tracking-tight">
                                {t("Inspeksi & Alokasi Putaway")}
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSave} className="p-4 space-y-3.5">
                    {/* Ringkasan Context SKU & PO Target */}
                    <div className="p-2.5 bg-muted/40 border border-border rounded-md space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                                {item.sku}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                                Barcode: {item.barcode}
                            </span>
                        </div>
                        <div className="font-semibold text-foreground text-xs">
                            {item.product_name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/60">
                            <span>
                                Batch: <strong className="font-mono text-foreground">{item.batch_no}</strong>
                            </span>
                            <span>
                                Exp: <strong className="font-mono text-foreground">{item.exp_date}</strong>
                            </span>
                            <span>
                                Target PO: <strong className="font-mono font-bold text-foreground">{item.po_qty} {item.unit}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Input Kuantitas Hasil Verifikasi */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                                {t("Hasil Verifikasi Fisik")}
                            </label>
                            <span className={`text-[10px] font-mono font-medium ${
                                isOverReceiving ? 'text-red-500 font-bold' : isUnderReceiving ? 'text-amber-600' : 'text-muted-foreground'
                            }`}>
                                Total: {totalInput} / {item.po_qty} {item.unit}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{t("Kondisi Baik")}</span>
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={goodQty}
                                    onChange={(e) => handleGoodQtyChange(e.target.value)}
                                    className="h-8 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs rounded-md"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>{t("Cacat / Rusak")}</span>
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={damagedQty}
                                    onChange={(e) => handleDamagedQtyChange(e.target.value)}
                                    className="h-8 font-mono font-bold text-amber-600 dark:text-amber-400 text-xs rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Penentuan Rak Penyimpanan */}
                    <div className="space-y-1">
                        <label className="font-semibold text-foreground">
                            {t("Lokasi Rak Penyimpanan (Barang Baik)")}
                        </label>
                        <Select value={selectedRack} onValueChange={setSelectedRack}>
                            <SelectTrigger className="h-8 w-full bg-background font-mono text-xs rounded-md">
                                <SelectValue placeholder={t("Pilih rak penyimpanan...")} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.length > 0 ? (
                                    locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.rack_code} className="font-mono text-xs">
                                            {loc.rack_code} {loc.zone ? `(${loc.zone})` : ''}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="DEFAULT" disabled className="text-xs">
                                        {t("Tidak ada rak tersedia")}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Catatan BAP (Hanya jika ada unit rusak) */}
                    <div className="p-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t("Lampiran Berita Acara (BAP)")}</span>
                        </div>
                        <Input
                            type="text"
                            value={damageNote}
                            onChange={(e) => {
                                setDamageNote(e.target.value);
                                setValidationError(null);
                            }}
                            placeholder={t("Catatan fisik barang rusak (Cth: Segel sobek)...")}
                            className="h-8 bg-background border-amber-200 dark:border-amber-900/60 text-xs rounded-md"
                        />
                    </div>

                    {/* Alert Error Validasi */}
                    {validationError && (
                        <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-[11px] font-medium flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-8 px-3 text-xs font-medium rounded-md"
                        >
                            {t("Batal")}
                        </Button>
                        <Button
                            type="submit"
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md gap-1.5"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{t("Simpan Alokasi")}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
