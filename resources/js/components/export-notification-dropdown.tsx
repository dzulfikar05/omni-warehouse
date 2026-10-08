import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Download, Loader2, CheckCircle2, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportLog {
    id: number;
    filename: string;
    type: string; // 'pdf' | 'excel'
    status: 'pending' | 'processing' | 'completed' | 'failed';
    file_path: string | null;
    created_at: string;
}

export function ExportNotificationDropdown() {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const [exports, setExports] = useState<ExportLog[]>([]);
    const [hasActive, setHasActive] = useState(false);

    const fetchExports = async () => {
        if (!tenantSlug) return;
        try {
            const res = await fetch(`/${tenantSlug}/contacts/customers/export-logs`);
            if (res.ok) {
                const data = await res.json();
                setExports(data);
                setHasActive(data.some((item: ExportLog) => item.status === 'pending' || item.status === 'processing'));
            }
        } catch (e) {
            console.error('Failed to fetch export notifications', e);
        }
    };

    useEffect(() => {
        fetchExports();
        const interval = setInterval(fetchExports, 4000);
        return () => clearInterval(interval);
    }, [tenantSlug]);

    // Helper untuk menentukan ikon dan warna sesuai tipe file
    const renderFileIcon = (item: ExportLog) => {
        const isExcel = item.type === 'excel' || item.filename.endsWith('.xlsx') || item.filename.endsWith('.xls');

        if (isExcel) {
            return <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
        }

        return <FileText size={16} className="text-red-500 dark:text-red-400 shrink-0" />;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl border border-border">
                    <Download size={16} />
                    {hasActive && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-2 space-y-1">
                <div className="text-xs font-semibold px-2 py-1.5 border-b border-border flex justify-between items-center">
                    <span>Export Queue Progress</span>
                    {hasActive && <Loader2 size={12} className="animate-spin text-blue-600" />}
                </div>

                {exports.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 text-center">Belum ada riwayat unduhan.</p>
                ) : (
                    exports.map((item) => (
                        <div key={item.id} className="p-2 text-xs rounded-lg hover:bg-muted flex items-center justify-between gap-2 border border-border/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {/* Panggil helper fungsi ikon di sini */}
                                {renderFileIcon(item)}
                                <div className="truncate">
                                    <p className="font-medium truncate">{item.filename}</p>
                                    <span className="text-[10px] text-muted-foreground capitalize">{item.status}</span>
                                </div>
                            </div>

                            {item.status === 'completed' && item.file_path && (
                                <a
                                    href={item.file_path}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 hover:bg-blue-100 flex items-center gap-1 text-[11px]"
                                >
                                    <CheckCircle2 size={14} /> Unduh
                                </a>
                            )}

                            {(item.status === 'pending' || item.status === 'processing') && (
                                <Loader2 size={14} className="animate-spin text-blue-600 shrink-0" />
                            )}

                            {item.status === 'failed' && (
                                <AlertCircle size={14} className="text-destructive shrink-0" />
                            )}
                        </div>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
