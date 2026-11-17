import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, X, PackageCheck, AlertTriangle } from 'lucide-react';
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

interface PutawayDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item: InboundItem | null;
    locations?: LocationOption[];
    onSave: (goodQty: number, damagedQty: number, rack: string, note: string) => void;
}

export const PutawayDrawer: React.FC<PutawayDrawerProps> = ({
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

    const handleSave = () => {
        // Validasi Bisnis: Barang rusak wajib memiliki catatan
        if (damagedQty > 0 && !damageNote.trim()) {
            setValidationError(t('Catatan kerusakan wajib diisi jika terdapat barang cacat/rusak.'));
            return;
        }

        // Validasi Bisnis: Lokasi rak untuk unit baik wajib dipilih
        if (goodQty > 0 && !selectedRack) {
            setValidationError(t('Pilih rak penyimpanan untuk barang kondisi baik.'));
            return;
        }

        onSave(goodQty, damagedQty, selectedRack, damageNote);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs transition-opacity duration-150"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <aside className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-card text-card-foreground border-l border-border shadow-xl flex flex-col justify-between font-sans text-xs">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div>
                        <h3 className="text-sm font-bold text-foreground tracking-tight">
                            {t("Inspeksi & Alokasi Putaway")}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {t("Penetapan slot rak fisik & verifikasi kondisi barang masuk")}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Ringkasan Item SKU */}
                    <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                                {item.sku}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                                {t("Batch:")} <strong className="text-foreground">{item.batch_no}</strong>
                            </span>
                        </div>
                        <div className="font-semibold text-foreground text-xs">
                            {item.product_name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                            <span>
                                {t("Target PO:")}{' '}
                                <strong className="font-mono text-foreground font-semibold">
                                    {item.po_qty} {item.unit}
                                </strong>
                            </span>
                            <span>
                                {t("Exp Date:")}{' '}
                                <strong className="font-mono text-foreground font-semibold">
                                    {item.exp_date}
                                </strong>
                            </span>
                        </div>
                    </div>

                    {/* Form Kuantitas Fisik */}
                    <div className="p-3 border border-border rounded-lg space-y-3 bg-card">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                                {t("Hasil Verifikasi Fisik")}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                Total: {goodQty + damagedQty} / {item.po_qty} {item.unit}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
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

                    {/* Selection Lokasi Rak Putaway */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">
                            {t("Lokasi Rak (Barang Baik)")}
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

                    {/* Penanganan Barang Rusak & Catatan BAP */}
                    <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t("Penanganan Anomali & Retur Supplier")}</span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-normal">
                            {t("Unit rusak dialokasikan otomatis ke rak")} <strong className="font-mono font-semibold">QUARANTINE-01</strong>.
                        </p>
                        <Input
                            type="text"
                            value={damageNote}
                            onChange={(e) => {
                                setDamageNote(e.target.value);
                                setValidationError(null);
                            }}
                            placeholder={t("Catatan kerusakan untuk lampiran BAP...")}
                            className="h-8 bg-background border-amber-200 dark:border-amber-900/60 text-xs rounded-md"
                        />
                    </div>

                    {/* Validation Error Alert */}
                    {validationError && (
                        <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-[11px] font-medium flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-8 px-3 text-xs font-medium rounded-md"
                    >
                        {t("Batal")}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md gap-1.5"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t("Simpan Alokasi")}</span>
                    </Button>
                </div>
            </aside>
        </>
    );
};
