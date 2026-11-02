import React, { useState } from 'react';
import { PauseCircle, X } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface HoldShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export const HoldShippingModal: React.FC<HoldShippingModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState<string>(
        'Keterlambatan Armada Truk Ekspedisi',
    );

    if (!isOpen) return null;

    const handleHold = () => {
        onConfirm(reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{t("Tunda / Hold Sesi Outbound")}</span>
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 flex flex-col gap-3 text-xs">
                    <p className="text-muted-foreground">
                        {t("Pilih alasan penundaan sesi outbound. Reservasi stok rak akan tetap dikunci sementara menunggu armada siap.")}</p>
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">{t("Alasan Penundaan")}</label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="h-9 w-full bg-background text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Keterlambatan Armada Truk Ekspedisi">
                                    {t("Keterlambatan Armada Truk Ekspedisi")}
                                </SelectItem>
                                <SelectItem value="Perubahan Alamat / Jadwal dari Customer">
                                    {t("Perubahan Alamat / Jadwal dari Customer")}
                                </SelectItem>
                                <SelectItem value="Verifikasi Ulang Selisih Barang di Rak">
                                    {t("Verifikasi Ulang Selisih Barang di Rak")}
                                </SelectItem>
                                <SelectItem value="Hujan lebat di Loading Dock Pengiriman">
                                    {t("Hujan lebat di Loading Dock Pengiriman")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="h-9 px-4 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold text-foreground cursor-pointer"
                    >
                        {t("Kembali Bekerja")}</button>
                    <button
                        onClick={handleHold}
                        className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                    >
                        {t("Hold Sesi")}</button>
                </div>
            </div>
        </div>
    );
};
