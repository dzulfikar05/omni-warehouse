import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, Save, X } from 'lucide-react';
import type { OutboundItem } from '@/types/outbound';

interface PackingDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item: OutboundItem | null;
    onSave: (pickedQty: number, packedQty: number, note: string) => void;
}

export const PackingDrawer: React.FC<PackingDrawerProps> = ({
    isOpen,
    onClose,
    item,
    onSave,
}) => {
    const [pickedQty, setPickedQty] = useState<number>(0);
    const [packedQty, setPackedQty] = useState<number>(0);
    const [issueNote, setIssueNote] = useState<string>('');

    useEffect(() => {
        if (item) {
            setPickedQty(item.picked_qty);
            setPackedQty(item.packed_qty);
            setIssueNote(item.issue_note || '');
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSave = () => {
        onSave(pickedQty, packedQty, issueNote);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
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
                                Verifikasi Picking &amp; Packing Dus
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Konfirmasi item yang diambil dari rak ke meja packing
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
                                RAK ASAL: <strong className="text-foreground">{item.source_rack}</strong>
                            </span>
                        </div>
                        <div className="font-semibold text-foreground text-xs mt-0.5">
                            {item.product_name}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border mt-1">
                            <span>
                                Target SO:{' '}
                                <strong className="font-mono text-foreground">
                                    {item.so_qty} {item.unit}
                                </strong>
                            </span>
                            <span>
                                Batch:{' '}
                                <strong className="font-mono text-foreground">
                                    {item.batch_no}
                                </strong>
                            </span>
                        </div>
                    </div>

                    {/* Form Picking & Packing */}
                    <div className="p-3.5 border border-border rounded-xl flex flex-col gap-3 bg-muted/20">
                        <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
                            Progress Pengambilan &amp; Packing
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-medium text-muted-foreground">
                                    Diambil dari Rak (Picked)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={pickedQty}
                                    onChange={(e) => setPickedQty(Number(e.target.value))}
                                    className="w-full h-8 px-2 mt-1 bg-muted/50 focus:bg-card border border-input rounded-md font-mono font-bold text-blue-600 dark:text-blue-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-muted-foreground">
                                    Verifikasi Dus (Packed)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={packedQty}
                                    onChange={(e) => setPackedQty(Number(e.target.value))}
                                    className="w-full h-8 px-2 mt-1 bg-muted/50 focus:bg-card border border-input rounded-md font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Alert / Catatan */}
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Catatan Masalah / Selisih Rak</span>
                        </div>
                        <input
                            type="text"
                            value={issueNote}
                            onChange={(e) => setIssueNote(e.target.value)}
                            placeholder="Catatan selisih (Cth: Stok di rak kosong, minta refill)..."
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
                        <span>Simpan Progress</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
