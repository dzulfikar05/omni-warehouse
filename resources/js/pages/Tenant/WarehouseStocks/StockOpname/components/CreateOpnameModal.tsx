import React from 'react';
import { ClipboardCheck, X, ChevronDown, PlusCircle } from 'lucide-react';

interface CreateOpnameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
}

export function CreateOpnameModal({ isOpen, onClose, onSubmitSuccess }: CreateOpnameModalProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-blue-600" />
                            <span>Inisiasi Sesi Stock Opname Baru</span>
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Jadwalkan area audit rak ke antrean tugas operator mobile
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-stone-700">
                                Pilih Gudang <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full h-9 pl-3 pr-8 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-lg text-stone-900 outline-none cursor-pointer font-medium appearance-none">
                                    <option value="1">WH Cakung Utama (DC-JKT-01)</option>
                                    <option value="2">WH Surabaya Rungkut (DC-SBY-02)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-stone-700">
                                Zona / Area Target <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full h-9 pl-3 pr-8 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-lg text-stone-900 outline-none cursor-pointer font-medium appearance-none">
                                    <option value="A">Zona A (Fast-Moving & Instant Food)</option>
                                    <option value="B">Zona B (Cooking Oil & Dry Goods)</option>
                                    <option value="ALL">Semua Rak Gudang (Full Wall-to-Wall)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-stone-700">
                                Tipe & Siklus Audit <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full h-9 pl-3 pr-8 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-lg text-stone-900 outline-none text-xs font-medium cursor-pointer appearance-none">
                                    <option value="monthly">Bulanan (Monthly Cut-Off)</option>
                                    <option value="cycle_count">Cycle Count (Harian / Mingguan ABC)</option>
                                    <option value="quarterly">Kuartalan / Per 3 Bulan (Q1 - Q4)</option>
                                    <option value="semester">Semesteran / Per 6 Bulan</option>
                                    <option value="annual">Tahunan (Year-End Wall-to-Wall)</option>
                                    <option value="adhoc">Insidental / Ad-Hoc Discrepancy</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-stone-700">
                                Batas Waktu Cut-Off Saldo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                defaultValue="2026-09-17T18:00"
                                className="w-full h-9 px-3 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-lg font-mono text-xs text-stone-900 outline-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-stone-700">
                                Metode Audit <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full h-9 pl-3 pr-8 bg-stone-50 hover:bg-white border border-stone-200 rounded-lg text-stone-900 outline-none cursor-pointer appearance-none font-medium">
                                    <option value="blind">Blind Count (Sembunyikan Angka Sistem)</option>
                                    <option value="open">Open Count (Tampilkan Angka Estimasi)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-stone-700">
                                Penanggung Jawab (Auditor) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select className="w-full h-9 pl-3 pr-8 bg-stone-50 hover:bg-white border border-stone-200 rounded-lg text-stone-900 outline-none cursor-pointer appearance-none font-medium">
                                    <option value="1">Andika Pratama (Lead Ops)</option>
                                    <option value="2">Budi Santoso (Senior Staff)</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-stone-700">Catatan / Alasan Sesi</label>
                        <input
                            type="text"
                            placeholder="Cth: Audit rutin bulanan periode September 2026..."
                            className="w-full h-9 px-3 bg-stone-50 hover:bg-white border border-stone-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 rounded-lg text-stone-900 placeholder-stone-400 outline-none text-xs"
                        />
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Buka Sesi Audit</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
