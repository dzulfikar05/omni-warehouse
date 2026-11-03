import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { FileCheck2, Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MasterSku {
    id: number;
    sku: string;
    product_name: string;
}

interface CustomerOption {
    id: number;
    name: string;
}

interface CreateManifestModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: CustomerOption[];
    masterSkus: MasterSku[];
}

export interface SkuRowFormItem {
    id: string;
    sku_id: number;
    so_qty: number;
}

interface OutboundManifestForm {
    customer_id: string;
    vehicle_no: string;
    driver_name: string;
    notes: string;
    items: SkuRowFormItem[];
}

export const CreateManifestModal: React.FC<CreateManifestModalProps> = ({
    isOpen,
    onClose,
    customers = [],
    masterSkus = [],
}) => {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, reset, errors } = useForm<OutboundManifestForm>({
        customer_id: '',
        vehicle_no: '',
        driver_name: '',
        notes: '',
        items: [],
    });

    if (!isOpen) return null;

    const handleAddRow = () => {
        if (!masterSkus.length) {
            toast.error(t('Tidak ada Master SKU tersedia di database!'));
            return;
        }
        const newRow: SkuRowFormItem = {
            id: String(Date.now()),
            sku_id: masterSkus[0].id,
            so_qty: 10,
        };
        setData('items', [...data.items, newRow]);
    };

    const handleRemoveRow = (rowId: string) => {
        setData('items', data.items.filter((r) => r.id !== rowId));
    };

    const handleSkuChange = (rowId: string, skuIdStr: string) => {
        const selectedId = Number(skuIdStr);
        setData(
            'items',
            data.items.map((r) => (r.id === rowId ? { ...r, sku_id: selectedId } : r))
        );
    };

    const handleQtyChange = (rowId: string, qty: number) => {
        setData(
            'items',
            data.items.map((r) => (r.id === rowId ? { ...r, so_qty: qty } : r))
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.customer_id) {
            toast.error(t('Pilih Customer / Pelanggan terlebih dahulu!'));
            return;
        }
        if (!data.items.length) {
            toast.error(t('Manifest Outbound harus memiliki minimal 1 item barang!'));
            return;
        }

        post(`/${tenantSlug}/transactions/outbound`, {
            onSuccess: () => {
                toast.success(t('Manifest Outbound SO berhasil diinisiasi!'));
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                                {t("Inisiasi Manifest Outbound SO Baru")}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {t("Registrasi pengeluaran barang & picking ke pelanggan")}
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

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs overflow-y-auto">
                    <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-foreground">{t("Pilih Customer / Pelanggan")}</label>
                        <Select
                            value={data.customer_id}
                            onValueChange={(val) => setData('customer_id', val)}
                        >
                            <SelectTrigger className="h-9 w-full bg-background text-foreground font-medium">
                                <SelectValue placeholder={t("Pilih Customer...")} />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map((cust) => (
                                    <SelectItem key={cust.id} value={String(cust.id)}>
                                        {cust.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.customer_id && <span className="text-red-500 text-[10px]">{errors.customer_id}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-foreground">{t("No. Kendaraan (Opsional)")}</label>
                            <input
                                type="text"
                                value={data.vehicle_no}
                                onChange={(e) => setData('vehicle_no', e.target.value)}
                                placeholder="Nopol (cth: B 1234 CD)"
                                className="h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-foreground">{t("Nama Driver (Opsional)")}</label>
                            <input
                                type="text"
                                value={data.driver_name}
                                onChange={(e) => setData('driver_name', e.target.value)}
                                placeholder="Nama pengemudi"
                                className="h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground"
                            />
                        </div>
                    </div>

                    <div className="border border-border rounded-xl p-3 bg-muted/30 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-bold text-foreground block">{t("Daftar Barang Demand SO")}</span>
                                <span className="text-[11px] text-muted-foreground">{t("Pilih item SKU dan target jumlah unit yang di-pick")}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="h-7 px-2.5 bg-muted hover:bg-muted/80 text-foreground border border-input rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>{t("+ Tambah Barang")}</span>
                            </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {data.items.map((row) => (
                                <div key={row.id} className="grid grid-cols-12 gap-2 items-center bg-card border border-border p-2 rounded-lg shadow-2xs">
                                    <div className="col-span-8">
                                        <Select
                                            value={String(row.sku_id)}
                                            onValueChange={(val) => handleSkuChange(row.id, val)}
                                        >
                                            <SelectTrigger className="h-8 w-full bg-background text-foreground font-medium text-[11px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterSkus.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.sku} - {m.product_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            min={1}
                                            value={row.so_qty}
                                            onChange={(e) => handleQtyChange(row.id, parseInt(e.target.value) || 1)}
                                            placeholder={t("Qty")}
                                            className="w-full h-8 px-1.5 bg-background border border-input rounded text-center font-bold text-[11px] text-foreground"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="text-muted-foreground hover:text-red-500 cursor-pointer p-1 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold cursor-pointer transition-colors"
                        >
                            {t("Batal")}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer transition-all"
                        >
                            {processing ? t("Menyimpan...") : t("Inisiasi Manifest Outbound")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
