import React from 'react';
import { CheckCheck, Database, PackageCheck, ShieldAlert, X } from 'lucide-react';
import type { OutboundManifest } from '@/types/outbound';

interface DispatchCommitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    manifest: OutboundManifest;
}

export const DispatchCommitModal: React.FC<DispatchCommitModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    manifest,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                                Terbitkan Surat Jalan &amp; Potong Stok LIVE
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Konfirmasi keberangkatan armada &amp; pemotongan fisik rak
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex flex-col gap-4 text-xs">
                    <div className="bg-muted/50 border border-border rounded-xl p-3.5 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-muted-foreground font-mono">Kode Shipping SO</span>
                            <div className="font-mono font-bold text-foreground text-sm">
                                {manifest.manifest_code}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] text-muted-foreground font-mono">Shipping Dock</span>
                            <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                                {manifest.warehouse_name} ({manifest.dock_bay || 'DOCK-OUT-01'})
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                                <span>Fisik Lolos Verifikasi</span>
                                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tracking-tight">
                                {manifest.packed_units}{' '}
                                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">Unit</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400/80 mt-1">
                                Siap dimuat ke armada ekspedisi
                            </span>
                        </div>

                        <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-semibold text-[11px]">
                                <span>Penerima / Customer</span>
                                <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="mt-2 text-sm font-bold font-sans text-purple-700 dark:text-purple-400 tracking-tight truncate">
                                {manifest.customer_name || '-'}
                            </div>
                            <span className="text-[10px] text-purple-700 dark:text-purple-400/80 mt-1">
                                Verifikasi penerima valid
                            </span>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50/40 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 rounded-xl text-foreground text-[11px] leading-relaxed">
                        ⚠️ Tindakan ini akan mengunci sesi outbound, menerbitkan Surat Jalan resmi, dan mengurangi kuota saldo stok live gudang secara permanen.
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
                    >
                        Periksa Kembali
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        <CheckCheck className="w-4 h-4" />
                        <span>Ya, Terbitkan &amp; Potong Stok</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
