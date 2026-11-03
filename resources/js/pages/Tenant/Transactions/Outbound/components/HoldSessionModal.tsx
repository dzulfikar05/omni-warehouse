import React, { useState } from 'react';
import { PauseCircle, X } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const { t } = useTranslation();
    const [reason, setReason] = useState<string>('Operator Shift Change (Shift 1 to Shift 2)');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <PauseCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground tracking-tight">
                            {t("Hold / Postpone Picking Session")}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
                    <p className="text-muted-foreground leading-relaxed">
                        {t("Pilih alasan penundaan proses picking outbound. Data scan sementara akan dibekukan tanpa mengurangi stok rak.")}
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">
                            {t("Alasan Penundaan Picking")}
                        </label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="h-9 w-full bg-background text-foreground font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Operator Shift Change (Shift 1 to Shift 2)">
                                    {t("Pergantian Shift Operator Picking")}
                                </SelectItem>
                                <SelectItem value="Armada Pengangkut / Truk Belum Tiba">
                                    {t("Armada Pengangkut / Truk Belum Tiba")}
                                </SelectItem>
                                <SelectItem value="Barang di Rak Tertutup / Butuh Forklift">
                                    {t("Barang di Rak Tertutup / Butuh Forklift")}
                                </SelectItem>
                                <SelectItem value="Investigasi Selisih Stok Membutuhkan Waktu">
                                    {t("Investigasi Selisih Stok Membutuhkan Waktu")}
                                </SelectItem>
                                <SelectItem value="Hujan lebat di Loading Dock Pengiriman">
                                    {t("Hujan lebat di Loading Dock Pengiriman")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold cursor-pointer transition-colors"
                        >
                            {t("Batal")}
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold shadow-md cursor-pointer transition-all"
                        >
                            {t("Hold Sesi Picking")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
