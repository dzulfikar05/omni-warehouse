import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, X, PackageCheck, AlertTriangle, Layers } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import type { OutboundItem } from '@/types/outbound';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationOption {
    id: number;
    rack_code: string;
    zone?: string;
}

interface PickingModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: OutboundItem | null;
    locations?: LocationOption[];
    onSave: (goodQty: number, damagedQty: number, rackId: number | null, note: string) => void;
}

export const PickingModal: React.FC<PickingModalProps> = ({
    isOpen,
    onClose,
    item,
    locations = [],
    onSave,
}) => {
    const { t } = useTranslation();
    const [goodQty, setGoodQty] = useState<number>(0);
    const [damagedQty, setDamagedQty] = useState<number>(0);
    const [selectedRackId, setSelectedRackId] = useState<string>('');
    const [damageNote, setDamageNote] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (item) {
            setGoodQty(item.good_qty ?? 0);
            setDamagedQty(item.damaged_qty ?? 0);
            const activeRack = item.target_rack || item.source_rack;
            const defaultLoc = locations.find(l => l.rack_code === activeRack);
            setSelectedRackId(defaultLoc ? String(defaultLoc.id) : (locations[0] ? String(locations[0].id) : ''));
            setDamageNote(item.damage_note || '');
            setValidationError(null);
        }
    }, [item, locations]);

    if (!isOpen || !item) return null;

    const targetDemand = item.so_qty ?? 0;

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
        const totalInput = goodQty + damagedQty;

        if (totalInput > targetDemand) {
            setValidationError(t('Total kuantitas pick (Baik + Rusak) tidak boleh melebihi target demand SO.'));
            return;
        }

        if (damagedQty > 0 && !damageNote.trim()) {
            setValidationError(t('Catatan selisih/kerusakan wajib diisi jika ada barang batal/rusak saat picking.'));
            return;
        }

        if (goodQty > 0 && !selectedRackId) {
            setValidationError(t('Pilih rak asal pengambilan barang (Picking Source Rack).'));
            return;
        }

        onSave(goodQty, damagedQty, selectedRackId ? Number(selectedRackId) : null, damageNote);
    };

    const totalInput = goodQty + damagedQty;
    const isOverReceiving = totalInput > targetDemand;
    const isUnderReceiving = totalInput < targetDemand && totalInput > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-card text-card-foreground border border-border rounded-lg w-full max-w-lg shadow-xl overflow-hidden flex flex-col text-xs">
                <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <div>
                            <h3 className="text-xs font-bold text-foreground tracking-tight">
                                {t("Inspeksi & Alokasi Rak Asal Picking")}
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

                <form onSubmit={handleSave} className="p-4 space-y-3.5">
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
                                Target Demand SO: <strong className="font-mono font-bold text-foreground">{targetDemand} {item.unit}</strong>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                                {t("Hasil Picking Fisik Gudang")}
                            </label>
                            <span className={`text-[10px] font-mono font-medium ${
                                isOverReceiving ? 'text-red-500 font-bold' : isUnderReceiving ? 'text-amber-600' : 'text-muted-foreground'
                            }`}>
                                Total: {totalInput} / {targetDemand} {item.unit}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{t("Picked (Baik)")}</span>
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
                                    <span>{t("Batal / Rusak")}</span>
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

                    <div className="space-y-1">
                        <label className="font-semibold text-foreground">
                            {t("Pilih Rak Asal Pencabutan Stok (Source Rack)")}
                        </label>
                        <Select value={selectedRackId} onValueChange={setSelectedRackId}>
                            <SelectTrigger className="h-8 w-full bg-background font-mono text-xs rounded-md">
                                <SelectValue placeholder={t("Pilih rak asal...")} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.length > 0 ? (
                                    locations.map((loc) => (
                                        <SelectItem key={loc.id} value={String(loc.id)} className="font-mono text-xs">
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

                    <div className="p-2.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t("Catatan Selisih / Kerusakan Picking")}</span>
                        </div>
                        <Input
                            type="text"
                            value={damageNote}
                            onChange={(e) => {
                                setDamageNote(e.target.value);
                                setValidationError(null);
                            }}
                            placeholder={t("Catatan jika barang rusak di rak/batal pick...")}
                            className="h-8 bg-background border-amber-200 dark:border-amber-900/60 text-xs rounded-md"
                        />
                    </div>

                    {validationError && (
                        <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-[11px] font-medium flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}

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
                            <span>{t("Simpan Picking")}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
