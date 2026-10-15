import React, { FormEvent } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { ClipboardCheck, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CreateOpnameModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateOpnameModal({ isOpen, onClose }: CreateOpnameModalProps) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors, reset } = useForm({
        warehouse_id: '1',
        zone: 'ALL',
        audit_type: 'monthly',
        cut_off_date: '2026-09-17T18:00',
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/stock-opname/sessions`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-card border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-card-foreground">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-blue-600" />
                            <span>Inisiasi Sesi Stock Opname Baru</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Jadwalkan area audit rak ke antrean tugas operator mobile
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-foreground">
                                Pilih Gudang <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.warehouse_id}
                                onValueChange={(val) => setData('warehouse_id', val)}
                            >
                                <SelectTrigger className="h-9 text-xs rounded-xl border-border bg-background">
                                    <SelectValue placeholder="Pilih Gudang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">WH Cakung Utama (DC-JKT-01)</SelectItem>
                                    <SelectItem value="2">WH Surabaya Rungkut (DC-SBY-02)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.warehouse_id && <span className="text-xs text-destructive">{errors.warehouse_id}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-semibold text-foreground">
                                Zona / Area Target <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.zone}
                                onValueChange={(val) => setData('zone', val)}
                            >
                                <SelectTrigger className="h-9 text-xs rounded-xl border-border bg-background">
                                    <SelectValue placeholder="Pilih Zona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua Rak Gudang (Full Wall-to-Wall)</SelectItem>
                                    <SelectItem value="A">Zona A (Fast-Moving & Instant Food)</SelectItem>
                                    <SelectItem value="B">Zona B (Cooking Oil & Dry Goods)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.zone && <span className="text-xs text-destructive">{errors.zone}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-foreground">
                                Tipe & Siklus Audit <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.audit_type}
                                onValueChange={(val) => setData('audit_type', val)}
                            >
                                <SelectTrigger className="h-9 text-xs rounded-xl border-border bg-background">
                                    <SelectValue placeholder="Tipe Audit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Bulanan (Monthly Cut-Off)</SelectItem>
                                    <SelectItem value="cycle_count">Cycle Count (Harian / Mingguan ABC)</SelectItem>
                                    <SelectItem value="annual">Tahunan (Year-End Wall-to-Wall)</SelectItem>
                                    <SelectItem value="adhoc">Insidental / Ad-Hoc Discrepancy</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.audit_type && <span className="text-xs text-destructive">{errors.audit_type}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-semibold text-foreground">
                                Batas Waktu Cut-Off Saldo <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="datetime-local"
                                value={data.cut_off_date}
                                onChange={(e) => setData('cut_off_date', e.target.value)}
                                className="h-9 text-xs rounded-xl border-border bg-background font-mono"
                            />
                            {errors.cut_off_date && <span className="text-xs text-destructive">{errors.cut_off_date}</span>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Catatan / Alasan Sesi</Label>
                        <Input
                            type="text"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Cth: Audit rutin bulanan..."
                            className="h-9 text-xs rounded-xl border-border bg-background"
                        />
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-end gap-2 mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl border-border text-xs"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-md"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{processing ? 'Saving...' : 'Buka Sesi Audit'}</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
