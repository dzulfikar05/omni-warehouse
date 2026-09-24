import React from 'react';
import { FileText, Printer, X } from 'lucide-react';
import type { InboundItem, InboundManifest } from '@/types/inbound';

interface BapPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    manifest: InboundManifest;
    items: InboundItem[];
}

export const BapPreviewModal: React.FC<BapPreviewModalProps> = ({
    isOpen,
    onClose,
    manifest,
    items,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <div>
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Preview Berita Acara Penerimaan (BAP)</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Dokumen resmi serah terima bongkar muatan gudang Cakung
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Printable Sheet Simulation */}
                <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4 text-xs font-sans">
                    {/* Document Header */}
                    <div className="flex items-start justify-between border-b border-border pb-4">
                        <div>
                            <div className="font-bold text-foreground text-base">
                                OMNIWAREHOUSE SYSTEM
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                                DC Cakung Utama, Blok B-4, Jakarta Timur
                            </div>
                            <div className="font-mono text-muted-foreground/70 text-[10px] mt-1">
                                Ref: DOC-BAP-202609-0142
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded font-mono font-bold text-[11px]">
                                BAP RESMI
                            </span>
                            <div className="text-muted-foreground text-[11px] mt-1 font-mono">
                                12/09/2026 • 13:30 WIB
                            </div>
                        </div>
                    </div>

                    {/* Meta Table */}
                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border text-[11px]">
                        <div>
                            <div>
                                Supplier:{' '}
                                <strong className="text-foreground">
                                    {manifest.supplier_name}
                                </strong>
                            </div>
                            <div>
                                No. PO Terkait:{' '}
                                <strong className="font-mono text-foreground">
                                    {manifest.manifest_code}
                                </strong>
                            </div>
                        </div>
                        <div>
                            <div>
                                Kendaraan:{' '}
                                <strong className="font-mono text-foreground">
                                    {manifest.vehicle_no} ({manifest.vehicle_type})
                                </strong>
                            </div>
                            <div>
                                Sopir / Kurir:{' '}
                                <strong className="text-foreground">
                                    {manifest.driver_name} ({manifest.driver_phone})
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Summary Ledger Items */}
                    <table className="w-full text-left border border-border rounded-lg text-[11px] overflow-hidden">
                        <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="p-2">Item SKU</th>
                                <th className="p-2 text-right">PO</th>
                                <th className="p-2 text-right">Fisik Baik</th>
                                <th className="p-2 text-right text-red-600 dark:text-red-400">Rusak</th>
                                <th className="p-2">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className={item.status === 'issue' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}
                                >
                                    <td className="p-2 font-mono font-medium text-foreground">
                                        {item.sku} ({item.product_name})
                                    </td>
                                    <td className="p-2 text-right font-mono text-foreground">{item.po_qty}</td>
                                    <td className="p-2 text-right font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                        {item.good_qty}
                                    </td>
                                    <td className="p-2 text-right font-mono text-red-600 dark:text-red-400 font-bold">
                                        {item.damaged_qty}
                                    </td>
                                    <td className="p-2 text-muted-foreground">
                                        {item.damage_note ||
                                            (item.status === 'valid'
                                                ? 'Lengkap & Segel Sempurna'
                                                : item.status === 'process'
                                                  ? 'Proses Scan'
                                                  : 'Menunggu Scan')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Signatures Area */}
                    <div className="grid grid-cols-2 gap-8 pt-4 mt-2 border-t border-border text-center text-[11px]">
                        <div>
                            <div className="text-muted-foreground mb-10">Pihak Pengemudi / Ekspedisi</div>
                            <div className="font-bold text-foreground underline">
                                {manifest.driver_name}
                            </div>
                            <div className="text-muted-foreground/70 text-[10px]">Driver Supplier</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground mb-10">Penerima Gudang (Lead Ops)</div>
                            <div className="font-bold text-foreground underline">
                                {manifest.operator_name}
                            </div>
                            <div className="text-muted-foreground/70 text-[10px]">
                                OmniWarehouse DC Cakung
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="px-6 py-3 border-t border-border bg-muted/40 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-mono">
                        Format PDF A4 Siap Cetak
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="h-9 px-3 bg-card hover:bg-muted border border-border rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Sekarang</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
