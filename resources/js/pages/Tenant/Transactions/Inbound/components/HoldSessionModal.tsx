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
                {/* Modal Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <PauseCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground tracking-tight">
                            {t("Postpone / Hold Unloading Session")}
                        </h3>
                    </div>
                    {/* Tombol Close Top Right */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
                    <p className="text-muted-foreground leading-relaxed">
                        {t("Select a reason for receiving session delay. Temporary scan data will be frozen without deducting PO quota.")}
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">
                            {t("Reason for Delay")}
                        </label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="h-9 w-full bg-background text-foreground font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Operator Shift Change (Shift 1 to Shift 2)">
                                    {t("Operator Shift Change (Shift 1 to Shift 2)")}
                                </SelectItem>
                                <SelectItem value="Forklift / Equipment Breakdown">
                                    {t("Forklift / Equipment Breakdown")}
                                </SelectItem>
                                <SelectItem value="Weather / Rain Delay at Unloading Dock">
                                    {t("Weather / Rain Delay at Unloading Dock")}
                                </SelectItem>
                                <SelectItem value="Discrepancy Investigation Required">
                                    {t("Discrepancy Investigation Required")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Modal Footer / Action Buttons */}
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5 mt-2">
                        {/* Tombol Return to Work (Menutup Modal Tanpa Aksi) */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold cursor-pointer transition-colors"
                        >
                            {t("Cancel")}
                        </button>
                        {/* Tombol Hold Session (Eksekusi Hold) */}
                        <button
                            type="submit"
                            className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold shadow-md cursor-pointer transition-all"
                        >
                            {t("Hold Session")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
