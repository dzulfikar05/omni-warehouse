import React from 'react';
import { Printer, X } from 'lucide-react';
import { ReconciliationItem, OpnameSession } from '@/types/stock-opname';

interface PrintSheetModalProps {
    isOpen: boolean;
    session: OpnameSession;
    items: ReconciliationItem[];
    onClose: () => void;
}

export function PrintSheetModal({ isOpen, session, items, onClose }: PrintSheetModalProps) {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 no-print">
            <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-4xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                        <Printer className="w-4 h-4 text-blue-600" />
                        <span>Lembar Kerja Opname Fisik (Form Blind Count A4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Dokumen</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Printable Document Sheet Container */}
                <div className="flex-1 overflow-y-auto p-6 bg-stone-200/60 flex justify-center">
                    <div id="printable-opname-sheet" className="bg-white w-full max-w-[780px] p-8 border border-stone-300 shadow-sm text-stone-900 font-sans text-xs">
                        <div className="flex justify-between items-start border-b-2 border-stone-900 pb-3">
                            <div>
                                <h1 className="text-base font-bold tracking-tight text-stone-900 uppercase">OMNIWAREHOUSE WMS</h1>
                                <p className="text-[11px] text-stone-600">Distribution Center Cakung Utama • Gudang {session.warehouse_code}</p>
                                <p className="text-[10px] text-stone-400">SOP-INV-04: Form Pemeriksaan Fisik Barang (Blind Count)</p>
                            </div>
                            <div className="text-right font-mono">
                                <span className="text-[10px] uppercase text-stone-400 block font-bold">No. Sesi Opname</span>
                                <span className="text-sm font-bold text-stone-900">{session.session_code}</span>
                                <span className="text-[10px] text-stone-500 block mt-0.5">Tanggal: 17/09/2026</span>
                            </div>
                        </div>

                        <table className="w-full my-3 border border-stone-300 text-[11px]">
                            <tbody>
                                <tr className="bg-stone-50">
                                    <td className="p-2 border-r border-stone-300 w-1/3">
                                        <span className="text-stone-400 block text-[10px]">ZONA / LORONG AUDIT:</span>
                                        <strong className="font-mono text-stone-800">{session.zone}</strong>
                                    </td>
                                    <td className="p-2 border-r border-stone-300 w-1/3">
                                        <span className="text-stone-400 block text-[10px]">LEAD AUDITOR / SPV:</span>
                                        <strong className="text-stone-800">{session.auditor_name}</strong>
                                    </td>
                                    <td className="p-2 w-1/3">
                                        <span className="text-stone-400 block text-[10px]">PETUGAS HITUNG LAPANGAN:</span>
                                        <span className="font-mono text-stone-500">................................................</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mb-3 px-3 py-1.5 bg-stone-100 border-l-2 border-stone-700 text-[10px] text-stone-600 italic">
                            Petugas lapangan wajib menghitung unit fisik aktual di rak tanpa melihat estimasi sistem buku. Tuliskan jumlah fisik dan paraf di kolom kanan.
                        </div>

                        <table className="w-full border-collapse border border-stone-400 text-[11px]">
                            <thead>
                                <tr className="bg-stone-100 text-stone-900 border-b border-stone-400 text-center font-bold">
                                    <th className="p-2 border border-stone-400 w-8">No</th>
                                    <th className="p-2 border border-stone-400 text-left">SKU / Nama Barang</th>
                                    <th className="p-2 border border-stone-400 w-20">Rak</th>
                                    <th className="p-2 border border-stone-400 w-24">Batch / Exp</th>
                                    <th className="p-2 border border-stone-400 w-24">Hasil Hitung Fisik</th>
                                    <th className="p-2 border border-stone-400 w-20">Paraf</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="border-b border-stone-300 font-mono">
                                        <td className="p-2 border border-stone-300 text-center">{idx + 1}</td>
                                        <td className="p-2 border border-stone-300 font-sans">
                                            <div className="font-bold text-stone-900">{item.name}</div>
                                            <div className="font-mono text-[10px] text-stone-500">{item.sku} • {item.barcode}</div>
                                        </td>
                                        <td className="p-2 border border-stone-300 text-center font-bold">{item.rack}</td>
                                        <td className="p-2 border border-stone-300 text-center text-[10px]">{item.batch}<br />{item.exp_date}</td>
                                        <td className="p-2 border border-stone-300 text-right text-stone-300 font-bold">....... {item.unit}</td>
                                        <td className="p-2 border border-stone-300 text-center"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
