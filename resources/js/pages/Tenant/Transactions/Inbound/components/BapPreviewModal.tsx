import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { InboundManifest, InboundItem } from '@/types/inbound';

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
    const { t } = useTranslation();
    const { current_tenant, general_settings } = usePage().props as any;

    if (!isOpen) return null;

    // Filter item yang memiliki anomali/cacat/rusak atau selisih
    const damagedItems = items.filter(
        (i) => i.damaged_qty > 0 || i.good_qty < i.po_qty || i.status === 'issue'
    );

    // MAPPING DATA SESUAI HASIL QUERY DATABASE GENERAL_SETTINGS
    const companyName = general_settings?.company_name || current_tenant?.name || 'PT Demo Logistik';
    const docHeaderHtml = general_settings?.doc_header_html || `<h2 style="margin:0; text-align:center;">${companyName}</h2>`;
    const docFooterHtml = general_settings?.doc_footer_html || '';
    const paperSize = general_settings?.doc_paper_size || 'A4';

    // Handler Cetak Menggunakan HTML Header & Footer dari Database
    const handlePrintBAP = () => {
        const printWindow = window.open('', '_blank', 'width=850,height=900');
        if (!printWindow) return;

        const damagedTableRows = damagedItems
            .map(
                (item, index) => `
            <tr>
                <td style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px; font-family: monospace;">${item.sku}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px;">${item.product_name}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px; text-align: center; font-family: monospace;">${item.batch_no}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right; font-family: monospace;">${item.po_qty} ${item.unit}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right; font-family: monospace;">${item.good_qty} ${item.unit}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right; font-family: monospace; color: #dc2626; font-weight: bold;">${item.damaged_qty} ${item.unit}</td>
                <td style="border: 1px solid #9ca3af; padding: 6px;">${item.damage_note || '-'}</td>
            </tr>
        `
            )
            .join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>BAP - ${manifest.manifest_code}</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11px; color: #111827; margin: 0; padding: 15px; }
                    .header-container { margin-bottom: 15px; border-b: 2px solid #111827; padding-bottom: 10px; }
                    .title { text-align: center; font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 15px 0 5px 0; text-decoration: underline; }
                    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    .meta-table td { padding: 4px 0; vertical-align: top; }
                    .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    .content-table th { border: 1px solid #6b7280; background-color: #f3f4f6; padding: 6px; font-weight: bold; text-align: left; }
                    .footer-html-container { margin-top: 20px; font-size: 10px; color: #4b5563; }
                    .ttd-container { width: 100%; margin-top: 35px; border-collapse: collapse; page-break-inside: avoid; }
                    .ttd-container td { text-align: center; vertical-align: bottom; height: 60px; }
                    @page { size: ${paperSize} portrait; margin: 12mm; }
                </style>
            </head>
            <body>
                <!-- KOP SURAT DINAMIS DARI DATABASE (doc_header_html) -->
                <div class="header-container">
                    ${docHeaderHtml}
                </div>

                <div class="title">BERITA ACARA PENERIMAAN & ANOMALI BARANG (BAP)</div>
                <p style="text-align: center; margin-top: 0; font-family: monospace;">Nomor: BAP/INB/${manifest.manifest_code}</p>

                <!-- META DATA MANIFEST -->
                <table class="meta-table">
                    <tr>
                        <td style="width: 15%;"><strong>Kode Manifest</strong></td>
                        <td style="width: 35%;">: ${manifest.manifest_code}</td>
                        <td style="width: 15%;"><strong>Tanggal Diterima</strong></td>
                        <td style="width: 35%;">: ${new Date().toLocaleDateString('id-ID')}</td>
                    </tr>
                    <tr>
                        <td><strong>Nama Supplier</strong></td>
                        <td>: ${manifest.supplier_name}</td>
                        <td><strong>Petugas Receiver</strong></td>
                        <td>: ${manifest.operator_name || 'Operator Inbound'}</td>
                    </tr>
                </table>

                <p>Bersama dokumen ini menerangkan hasil verifikasi fisik bongkar muat barang <i>(unloading receiving)</i> sebagai berikut:</p>

                <!-- TABEL ITEM ANOMALI / RINCIAN BAP -->
                <table class="content-table">
                    <thead>
                        <tr>
                            <th style="text-align: center; width: 25px;">No</th>
                            <th>SKU</th>
                            <th>Deskripsi Produk</th>
                            <th style="text-align: center;">Batch</th>
                            <th style="text-align: right;">Target PO</th>
                            <th style="text-align: right;">Baik</th>
                            <th style="text-align: right;">Rusak</th>
                            <th>Keterangan Kerusakan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${damagedTableRows.length > 0 ? damagedTableRows : `<tr><td colSpan="8" style="text-align: center; padding: 10px; border: 1px solid #9ca3af;">Tidak ditemukan anomali atau kerusakan barang pada manifest ini.</td></tr>`}
                    </tbody>
                </table>

                <!-- FOOTER CATATAN DINAMIS DARI DATABASE (doc_footer_html) -->
                ${docFooterHtml ? `<div class="footer-html-container">${docFooterHtml}</div>` : ''}

                <!-- TANDA TANGAN LEBAR -->
                <table class="ttd-container">
                    <tr>
                        <td style="width: 33%;">
                            Petugas Penerima Gudang
                            <br/><br/><br/><br/>
                            ( ______________________ )
                        </td>
                        <td style="width: 33%;">
                            Pengemudi / Supir Expedisi
                            <br/><br/><br/><br/>
                            ( ______________________ )
                        </td>
                        <td style="width: 33%;">
                            Supervisor Inbound
                            <br/><br/><br/><br/>
                            ( ______________________ )
                        </td>
                    </tr>
                </table>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-card text-card-foreground border border-border rounded-lg w-full max-w-2xl shadow-xl overflow-hidden flex flex-col text-xs">
                {/* Header Modal */}
                <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold text-foreground tracking-tight">
                            {t("Pratinjau Cetak BAP Resmi")}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Pratinjau Tampilan Kop & Footer Database */}
                <div className="p-4 overflow-y-auto max-h-[70vh] space-y-3">
                    <div className="p-4 border border-border rounded-md bg-background space-y-3 shadow-2xs">
                        {/* Render HTML Kop Surat dari Database */}
                        <div
                            className="border-b border-border pb-3 prose dark:prose-invert max-w-none text-xs"
                            dangerouslySetInnerHTML={{ __html: docHeaderHtml }}
                        />

                        <div className="text-center py-1">
                            <h5 className="font-bold text-xs uppercase underline text-foreground">
                                BERITA ACARA PENERIMAAN & ANOMALI BARANG
                            </h5>
                            <p className="font-mono text-[10px] text-muted-foreground">
                                BAP/INB/{manifest.manifest_code}
                            </p>
                        </div>

                        {/* Summary Status Item */}
                        <div className="p-2.5 bg-muted/40 rounded border border-border flex items-center justify-between text-[11px]">
                            <span>
                                Total SKU Anomali/Rusak:{' '}
                                <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                                    {damagedItems.length} SKU
                                </strong>
                            </span>
                            <span className="text-muted-foreground font-mono">
                                Ukuran Kertas: <strong>{paperSize}</strong>
                            </span>
                        </div>

                        {/* Render HTML Footer Catatan dari Database */}
                        {docFooterHtml && (
                            <div
                                className="pt-2 border-t border-border text-[10px] text-muted-foreground prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: docFooterHtml }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer Action Modal */}
                <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-8 px-3 text-xs font-medium rounded-md"
                    >
                        {t("Tutup")}
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrintBAP}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t("Cetak Dokumen BAP")}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
