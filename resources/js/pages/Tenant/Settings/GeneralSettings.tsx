import React, { FormEvent, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import {
    Printer,
    Save,
    FileSpreadsheet,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Eye,
    Building2,
    FileCheck,
} from 'lucide-react';

interface SettingsProps {
    settings: Record<string, string>;
    tenant_profile?: {
        name: string;
        tax_number: string;
        logo: string | null;
    };
}

// Custom Lightweight Rich Text Editor
const SimpleRichTextEditor = ({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}) => {
    const editorRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-background">
            <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border text-foreground">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('bold')} title="Bold">
                    <Bold size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('italic')} title="Italic">
                    <Italic size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('underline')} title="Underline">
                    <Underline size={14} />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('justifyLeft')} title="Align Left">
                    <AlignLeft size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('justifyCenter')} title="Align Center">
                    <AlignCenter size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('justifyRight')} title="Align Right">
                    <AlignRight size={14} />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                    <List size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                    <ListOrdered size={14} />
                </Button>
            </div>

            <div
                ref={editorRef}
                contentEditable
                onInput={() => {
                    if (editorRef.current) {
                        onChange(editorRef.current.innerHTML);
                    }
                }}
                className="p-3 min-h-[110px] text-xs focus:outline-none prose prose-sm max-w-none dark:prose-invert"
                data-placeholder={placeholder}
            />
        </div>
    );
};

export default function GeneralSettings({ settings, tenant_profile }: SettingsProps) {
    const { flash, current_tenant } = usePage().props as any;
    const tenantSlug = current_tenant?.slug;

    // Ambil Data Profil Asli (Spatie Logo & Tax Number)
    const companyLogo = tenant_profile?.logo || current_tenant?.logo || null;
    const companyName = tenant_profile?.name || current_tenant?.name || 'PT LOGISTIK JAYA ABADI';
    const companyTaxNumber = tenant_profile?.tax_number || current_tenant?.tax_number || '';

    const { data, setData, post, processing } = useForm({
        doc_header_html:
            settings.doc_header_html ||
            `<p style="text-align: center;"><strong>${companyName}</strong><br>Jl. Boulevard No. 123, Jakarta Selatan | Telp: (021) 555-1234</p>`,
        doc_footer_html:
            settings.doc_footer_html ||
            '<p><em>* Barang yang sudah dibeli tidak dapat dikembalikan tanpa nota resmi.</em></p>',
        doc_show_logo: settings.doc_show_logo === '1' || settings.doc_show_logo === undefined,
        doc_show_npwp: settings.doc_show_npwp === '1' || settings.doc_show_npwp === undefined,
        doc_paper_size: settings.doc_paper_size || 'A4',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/settings/general-settings`);
    };

    return (
        <>
            <Head title="General Settings - Kop Surat & Cetak" />

            <div className="space-y-6 p-4">
                <PageHeader
                    title="General Settings"
                    description="Pengaturan Kop Surat (Header/Footer HTML) dan Preferensi Cetak PDF / Excel."
                />

                <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Form Editor (Sisi Kiri) */}
                        <div className="lg:col-span-7 rounded-xl border border-border bg-card p-5 shadow-xs text-card-foreground space-y-5">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Templat Kop Surat & Dokumen
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Atur susunan teks, alamat, dan format header/footer dokumen.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                        <Printer size={18} />
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                        <FileSpreadsheet size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={data.doc_show_logo}
                                            onChange={(e) => setData('doc_show_logo', e.target.checked)}
                                            className="rounded border-border bg-background text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        Tampilkan Logo Perusahaan
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={data.doc_show_npwp}
                                            onChange={(e) => setData('doc_show_npwp', e.target.checked)}
                                            className="rounded border-border bg-background text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                        Tampilkan NPWP di Header
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        Kop Surat Header (HTML Editor)
                                    </Label>
                                    <SimpleRichTextEditor
                                        value={data.doc_header_html}
                                        onChange={(html) => setData('doc_header_html', html)}
                                        placeholder="Ketik teks kop surat di sini..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">
                                        Catatan Kaki / Footer Dokumen (Syarat & Ketentuan)
                                    </Label>
                                    <SimpleRichTextEditor
                                        value={data.doc_footer_html}
                                        onChange={(html) => setData('doc_footer_html', html)}
                                        placeholder="Ketik syarat & ketentuan di sini..."
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border pt-3.5 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 h-9 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                                >
                                    <Save size={15} />
                                    {processing ? 'Saving...' : 'Save Document Settings'}
                                </Button>
                            </div>
                        </div>

                        {/* Live Interactive Preview Panel (Sisi Kanan) */}
                        <div className="lg:col-span-5 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                <Eye size={14} className="text-blue-600" /> Live Print Preview
                            </div>

                            <div className="rounded-xl border border-border bg-white text-black p-5 shadow-sm space-y-4 font-sans text-xs min-h-[380px] flex flex-col justify-between">
                                {/* Header Preview */}
                                <div>
                                    <div className="flex items-center justify-between gap-3 border-b-2 border-black pb-3">
                                        {/* Render Logo Spatie Asli Jika Checkbox Dicentang */}
                                        {data.doc_show_logo && (
                                            <div className="shrink-0">
                                                {companyLogo ? (
                                                    <img
                                                        src={companyLogo}
                                                        alt="Company Logo"
                                                        className="h-12 w-auto object-contain max-w-[100px]"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded border border-dashed border-gray-400 flex items-center justify-center text-gray-400 bg-gray-50">
                                                        <Building2 size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Teks HTML Header Kop Surat */}
                                        <div
                                            className="flex-1 prose prose-xs max-w-none text-black"
                                            dangerouslySetInnerHTML={{ __html: data.doc_header_html || '' }}
                                        />

                                        {/* Render NPWP Asli Jika Checkbox Dicentang */}
                                        {data.doc_show_npwp && (
                                            <div className="text-right shrink-0 font-mono text-[10px] text-gray-700 border-l border-gray-300 pl-2">
                                                <div className="font-semibold text-black flex items-center gap-1 justify-end">
                                                    <FileCheck size={12} /> NPWP / TAX ID
                                                </div>
                                                <span>{companyTaxNumber || 'Belum Diisi'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Placeholder Body Dokumen */}
                                <div className="my-6 border border-dashed border-gray-300 rounded p-4 text-center text-gray-400 bg-gray-50/50 space-y-1">
                                    <p className="font-semibold text-gray-500 text-[11px]">
                                        [ AREA ISI DOKUMEN / FAKTUR / SURAT JALAN ]
                                    </p>
                                    <p className="text-[10px]">Tabel barang dan detail transaksi akan tampil di area ini.</p>
                                </div>

                                {/* Footer Preview */}
                                <div className="border-t border-gray-300 pt-2 text-[10px] text-gray-600">
                                    <div
                                        className="prose prose-xs max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: data.doc_footer_html || '' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

GeneralSettings.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'General Settings', href: '#' },
    ],
};
