import { Printer, X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';
import type { OpnameSession, ReconciliationItem } from '@/types/stock-opname';

interface PrintSheetModalProps {
    isOpen: boolean;
    session: OpnameSession;
    items: ReconciliationItem[];
    onClose: () => void;
}

export function PrintSheetModal({
    isOpen,
    session,
    items,
    onClose,
}: PrintSheetModalProps) {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="no-print fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-150 fade-in">
            <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Printer className="h-4 w-4 text-blue-600" />
                        <span>
                            {t(
                                'Lembar Kerja Opname Fisik (Form Blind Count A4)',
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={handlePrint}
                            className="h-8 gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            <span>{t('Cetak Dokumen')}</span>
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 justify-center overflow-y-auto bg-muted/30 p-6">
                    <div
                        id="printable-opname-sheet"
                        className="w-full max-w-[780px] border border-stone-300 bg-white p-8 font-sans text-xs text-stone-900 shadow-sm"
                    >
                        <div className="flex items-start justify-between border-b-2 border-stone-900 pb-3">
                            <div>
                                <h1 className="text-base font-bold tracking-tight text-stone-900 uppercase">
                                    {t('OMNIWAREHOUSE WMS')}
                                </h1>
                                <p className="text-[11px] text-stone-600">
                                    {t('Distribution Center • Gudang')}{' '}
                                    {session.warehouse_code || t('DC')}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                    {t(
                                        'SOP-INV-04: Form Pemeriksaan Fisik Barang (Blind Count)',
                                    )}
                                </p>
                            </div>
                            <div className="text-right font-mono">
                                <span className="block text-[10px] font-bold text-stone-400 uppercase">
                                    {t('No. Sesi Opname')}
                                </span>
                                <span className="text-sm font-bold text-stone-900">
                                    {session.session_code}
                                </span>
                                <span className="mt-0.5 block text-[10px] text-stone-500">
                                    {t('Tanggal:')}{' '}
                                    {new Date().toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <table className="my-3 w-full border border-stone-300 text-[11px]">
                            <tbody>
                                <tr className="bg-stone-50">
                                    <td className="w-1/3 border-r border-stone-300 p-2">
                                        <span className="block text-[10px] text-stone-400">
                                            {t('LOKASI / RAK:')}
                                        </span>
                                        <strong className="font-mono text-stone-800">
                                            {session.location_label}
                                        </strong>
                                    </td>
                                    <td className="w-1/3 border-r border-stone-300 p-2">
                                        <span className="block text-[10px] text-stone-400">
                                            {t('LEAD AUDITOR / SPV:')}
                                        </span>
                                        <strong className="text-stone-800">
                                            {session.auditor_name ||
                                                t('Supervisor WMS')}
                                        </strong>
                                    </td>
                                    <td className="w-1/3 p-2">
                                        <span className="block text-[10px] text-stone-400">
                                            {t('PETUGAS HITUNG LAPANGAN:')}
                                        </span>
                                        <span className="font-mono text-stone-500">
                                            {t(
                                                '................................................',
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mb-3 border-l-2 border-stone-700 bg-stone-100 px-3 py-1.5 text-[10px] text-stone-600 italic">
                            {t(
                                'Petugas lapangan wajib menghitung unit fisik aktual di rak tanpa melihat estimasi sistem buku. Tuliskan jumlah fisik dan paraf di kolom kanan.',
                            )}
                        </div>

                        <table className="w-full border-collapse border border-stone-400 text-[11px]">
                            <thead>
                                <tr className="border-b border-stone-400 bg-stone-100 text-center font-bold text-stone-900">
                                    <th className="w-8 border border-stone-400 p-2">
                                        {'No'}
                                    </th>
                                    <th className="border border-stone-400 p-2 text-left">
                                        {'SKU / Nama Barang'}
                                    </th>
                                    <th className="w-20 border border-stone-400 p-2">
                                        {'Rak'}
                                    </th>
                                    <th className="w-24 border border-stone-400 p-2">
                                        {'Batch / Exp'}
                                    </th>
                                    <th className="w-24 border border-stone-400 p-2">
                                        {'Hasil Hitung Fisik'}
                                    </th>
                                    <th className="w-20 border border-stone-400 p-2">
                                        {'Paraf'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-stone-300 font-mono"
                                    >
                                        <td className="border border-stone-300 p-2 text-center">
                                            {idx + 1}
                                        </td>
                                        <td className="border border-stone-300 p-2 font-sans">
                                            <div className="font-bold text-stone-900">
                                                {item.name}
                                            </div>
                                            <div className="font-mono text-[10px] text-stone-500">
                                                {item.sku} {t('•')}{' '}
                                                {item.barcode}
                                            </div>
                                        </td>
                                        <td className="border border-stone-300 p-2 text-center font-bold">
                                            {item.rack}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-center text-[10px]">
                                            {item.batch}
                                            <br />
                                            {item.exp_date}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-right font-bold text-stone-300">
                                            {t('.......')} {item.unit}
                                        </td>
                                        <td className="border border-stone-300 p-2 text-center"></td>
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
