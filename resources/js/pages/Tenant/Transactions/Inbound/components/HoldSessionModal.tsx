import React, { useState } from 'react';
import { ChevronDown, PauseCircle, X } from 'lucide-react';

interface HoldSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export const HoldSessionModal: React.FC<HoldSessionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [reason, setReason] = useState<string>(
        'Pergantian Shift Operator (Shift 1 ke Shift 2)',
    );

    if (!isOpen) return null;

    const handleHold = () => {
        onConfirm(reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Tunda / Hold Sesi Bongkar Muat</span>
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 flex flex-col gap-3 text-xs">
                    <p className="text-muted-foreground">
                        Pilih alasan penundaan sesi receiving. Data scan sementara akan dibekukan tanpa memotong kuota PO.
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">Alasan Penundaan</label>
                        <div className="relative">
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full h-9 pl-3 pr-8 bg-muted/50 border border-input rounded-lg text-foreground outline-none cursor-pointer appearance-none"
                            >
                                <option value="Pergantian Shift Operator (Shift 1 ke Shift 2)">
                                    Pergantian Shift Operator (Shift 1 ke Shift 2)
                                </option>
                                <option value="Forklift Stacker mengalami kendala teknis">
                                    Forklift Stacker mengalami kendala teknis
                                </option>
                                <option value="Hujan lebat di area Loading Dock (Bongkar basah)">
                                    Hujan lebat di area Loading Dock (Bongkar basah)
                                </option>
                                <option value="Selisih fisik masif butuh konfirmasi Supplier">
                                    Selisih fisik masif butuh konfirmasi Supplier
                                </option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="h-9 px-4 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold text-foreground cursor-pointer"
                    >
                        Kembali Bekerja
                    </button>
                    <button
                        onClick={handleHold}
                        className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                    >
                        Hold Sesi
                    </button>
                </div>
            </div>
        </div>
    );
};
