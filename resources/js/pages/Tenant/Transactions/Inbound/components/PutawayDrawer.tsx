import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, Save, X } from 'lucide-react';
import type { InboundItem } from '@/types/inbound';

interface PutawayDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item: InboundItem | null;
    onSave: (goodQty: number, damagedQty: number, rack: string, note: string) => void;
}

export const PutawayDrawer: React.FC<PutawayDrawerProps> = ({
    isOpen,
    onClose,
    item,
    onSave,
}) => {
    const [goodQty, setGoodQty] = useState<number>(0);
    const [damagedQty, setDamagedQty] = useState<number>(0);
    const [selectedRack, setSelectedRack] = useState<string>('A-02-04');
    const [damageNote, setDamageNote] = useState<string>('');

    useEffect(() => {
        if (item) {
            setGoodQty(item.good_qty);
            setDamagedQty(item.damaged_qty);
            setSelectedRack(item.target_rack || 'A-02-04');
            setDamageNote(item.damage_note || '');
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = () => {
        onSave(goodQty, damagedQty, selectedRack, damageNote);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <aside className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-card text-card-foreground border-l border-border shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out font-sans">
                {/* Drawer Header */}
                <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0 bg-muted/40">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                                Inspeksi &amp; Alokasi Rak Putaway
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Penetapan slot rak fisik &amp; pencatatan anomali barang masuk
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
                    {/* Ringkasan SKU Item */}
                    <div className="p-3.5 bg-muted/40 border border-border rounded-xl flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                                {item.sku}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground">
                                Batch: {item.batch_no}
                            </span>
                        </div>
                        <div className="font-semibold text-foreground text-xs mt-0.5">
                            {item.product_name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border mt-1">
                            <span>
                                Target PO:{' '}
                                <strong className="font-mono text-foreground">
                                    {item.po_qty} {item.unit}
                                </strong>
                            </span>
                            <span>
                                Exp:{' '}
                                <strong className="font-mono text-foreground">
                                    {item.exp_date}
                                </strong>
                            </span>
                        </div>
                    </div>

                    {/* Form Penghitungan Fisik Masuk */}
                    <div className="p-3.5 border border-border rounded-xl flex flex-col gap-3 bg-muted/20">
                        <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                            Hasil Penghitungan Fisik Bongkar
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-medium text-muted-foreground">
                                    Kondisi Baik (Valid)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={goodQty}
                                    onChange={(e) => setGoodQty(Number(e.target.value))}
                                    className="w-full h-8 px-2 mt-1 bg-muted/50 focus:bg-card border border-input rounded-md font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-muted-foreground">
                                    Cacat / Bocor / Rusak
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={damagedQty}
                                    onChange={(e) => setDamagedQty(Number(e.target.value))}
                                    className="w-full h-8 px-2 mt-1 bg-muted/50 focus:bg-card border border-input rounded-md font-mono font-bold text-amber-600 dark:text-amber-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pemilihan Rak Simpan */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">
                            Rekomendasi Rak Penyimpanan (Putaway Location)
                        </label>
                        <div className="relative">
                            <select
                                value={selectedRack}
                                onChange={(e) => setSelectedRack(e.target.value)}
                                className="w-full h-9 pl-3 pr-8 bg-muted/50 hover:bg-muted focus:bg-card border border-input focus:border-blue-600 rounded-lg text-foreground outline-none transition-all cursor-pointer font-mono font-medium appearance-none"
                            >
                                <option value="A-02-04">A-02-04 (Zona Fast-Moving • Kapasitas 300 Unit)</option>
                                <option value="A-02-05">A-02-05 (Zona Fast-Moving • Kapasitas 200 Unit)</option>
                                <option value="B-01-01">B-01-01 (Zona Fast-Moving • Kapasitas 150 Unit)</option>
                                <option value="B-04-02">B-04-02 (Zona Dry Storage • Kapasitas 200 Unit)</option>
                                <option value="A-05-02">A-05-02 (Zona Dry Storage • Kapasitas 120 Unit)</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Quick Action: Buat Berita Acara Kerusakan (BAP) */}
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Penanganan Barang Rusak / Selisih</span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                            Unit rusak otomatis diarahkan ke{' '}
                            <strong className="font-mono font-bold">QUARANTINE-01</strong> dan dimasukkan ke draft lampiran BAP supplier.
                        </p>
                        <input
                            type="text"
                            value={damageNote}
                            onChange={(e) => setDamageNote(e.target.value)}
                            placeholder="Catatan kerusakan (Cth: Segel dus sobek, kaleng penyok dari supir)..."
                            className="w-full h-8 px-2 bg-card border border-amber-200 dark:border-amber-800 rounded-md text-[11px] text-foreground outline-none placeholder-amber-700/50 dark:placeholder-amber-400/50"
                        />
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-end gap-2 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="h-9 px-4 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Alokasi</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
