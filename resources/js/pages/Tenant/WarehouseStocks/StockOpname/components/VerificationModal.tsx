import React, { useState, useEffect } from 'react';
import { Package, X, HelpCircle, Check } from 'lucide-react';
import { ReconciliationItem } from '@/types/stock-opname';

interface VerificationModalProps {
    isOpen: boolean;
    item: ReconciliationItem | null;
    onClose: () => void;
    onSaveSuccess: (updatedItem: ReconciliationItem) => void;
}

export function VerificationModal({ isOpen, item, onClose, onSaveSuccess }: VerificationModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <h2 className="text-sm font-bold text-stone-900">Blind Count - Input Fisik Barang</h2>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Input jumlah riil yang ada di rak tanpa asumsi sistem
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col gap-4 text-xs">
                    {/* Item Card Banner */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-2xs">
                            <Package className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                    {item.sku}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-stone-700 bg-white border border-stone-200 px-2 py-0.5 rounded">
                                    Rak: {item.rack}
                                </span>
                            </div>
                            <h4 className="font-bold text-stone-900 text-sm mt-1 truncate">{item.name}</h4>
                            <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono mt-1">
                                <span>{item.barcode}</span>
                                <span>•</span>
                                <span>{item.batch}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-stone-800 flex items-center justify-between">
                            <span>
                                Hitungan Fisik Terhitung di Rak <span className="text-red-500">*</span>
                            </span>
                            <span className="text-stone-400 text-[11px] font-mono">
                                Buku: <span className="font-bold text-stone-700">{systemQty}</span> {item.unit}
                            </span>
                        </label>

                        <div className="relative">
                            <input
                                type="number"
                                value={physicalQty}
                                onChange={(e) => setPhysicalQty(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full h-12 px-3 bg-white border-2 border-stone-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-center font-mono font-bold text-2xl text-stone-900 outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-stone-400 font-bold">
                                {item.unit}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-1 font-mono">
                            <button
                                type="button"
                                onClick={() => quickAdd(1)}
                                className="h-8 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 font-bold text-xs cursor-pointer transition-colors"
                            >
                                +1
                            </button>
                            <button
                                type="button"
                                onClick={() => quickAdd(5)}
                                className="h-8 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 font-bold text-xs cursor-pointer transition-colors"
                            >
                                +5
                            </button>
                            <button
                                type="button"
                                onClick={() => quickAdd(10)}
                                className="h-8 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 font-bold text-xs cursor-pointer transition-colors"
                            >
                                +10
                            </button>
                            <button
                                type="button"
                                onClick={() => quickAdd(50)}
                                className="h-8 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 font-bold text-xs cursor-pointer transition-colors"
                            >
                                +50
                            </button>
                        </div>
                    </div>

                    {/* Variance Result Card */}
                    <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl flex items-center justify-between font-mono">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-stone-500" />
                            <span className="text-xs font-semibold text-stone-700">
                                {delta === 0 ? 'Fisik Sesuai Buku (0 Selisih)' : delta < 0 ? `Defisit (${delta} ${item.unit})` : `Surplus (+${delta} ${item.unit})`}
                            </span>
                        </div>
                        <span
                            className={`font-bold text-xs px-2 py-0.5 rounded ${
                                delta === 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : delta < 0
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                        >
                            {delta > 0 ? `+${delta}` : delta} {item.unit}
                        </span>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-stone-700">Catatan Kondisi Rak</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Cth: Ditemukan 2 kardus basah, atau salah tumpuk..."
                            className="w-full h-8 px-3 bg-stone-50 hover:bg-white border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-lg text-stone-900 outline-none text-xs"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-mono">[Enter] Simpan</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>Simpan Hasil Hitung</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
