import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, AlertCircle } from 'lucide-react';
import { LocationOption, SkuOption, WarehouseOption } from '@/types/stock_transfer';

interface CreateTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantSlug: string;
    warehouses: WarehouseOption[];
    locations: LocationOption[];
    skus: SkuOption[];
}

export const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
    isOpen,
    onClose,
    tenantSlug,
    warehouses,
    locations,
    skus,
}) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        sku_id: '',
        from_location_id: '',
        to_location_id: '',
        quantity: 1,
        notes: '',
    });

    const [warning, setWarning] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setWarning(null);

        if (data.from_location_id && data.to_location_id && data.from_location_id === data.to_location_id) {
            setWarning('Rak asal dan rak tujuan tidak boleh sama!');
            return;
        }

        post(`/tenant/${tenantSlug}/transactions/stock-transfer`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-card border-border text-foreground">
                <DialogHeader className="border-b border-border pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <ArrowRightLeft className="w-5 h-5 text-primary" />
                        Buat Mutasi Transfer Stok
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {warning && (
                        <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{warning}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="sku_id">Pilih Produk / SKU</Label>
                        <Select
                            value={data.sku_id}
                            onValueChange={(val) => setData('sku_id', val)}
                        >
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Pilih SKU barang..." />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {skus.length > 0 ? (
                                    skus.map((sku) => (
                                        <SelectItem key={sku.id} value={String(sku.id)}>
                                            {sku.code} - {sku.name} (Stok: {sku.current_stock})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="demo-sku-1">SKU-8849 - Indomie Goreng Spasial (Stok: 150)</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.sku_id && <p className="text-xs text-destructive">{errors.sku_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="from_location_id">Rak Asal (Origin)</Label>
                            <Select
                                value={data.from_location_id}
                                onValueChange={(val) => setData('from_location_id', val)}
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Pilih Rak Asal..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {locations.length > 0 ? (
                                        locations.map((loc) => (
                                            <SelectItem key={loc.id} value={String(loc.id)}>
                                                {loc.code} ({loc.name})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="loc-1">RAK-A1-01 (Zone Picking)</SelectItem>
                                            <SelectItem value="loc-2">RAK-B2-04 (Zone Bulk Storage)</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.from_location_id && <p className="text-xs text-destructive">{errors.from_location_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="to_location_id">Rak Tujuan (Destination)</Label>
                            <Select
                                value={data.to_location_id}
                                onValueChange={(val) => setData('to_location_id', val)}
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Pilih Rak Tujuan..." />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {locations.length > 0 ? (
                                        locations.map((loc) => (
                                            <SelectItem key={loc.id} value={String(loc.id)}>
                                                {loc.code} ({loc.name})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="loc-3">RAK-C1-02 (Zone Restock)</SelectItem>
                                            <SelectItem value="loc-4">RAK-Q0-99 (Quarantine Zone)</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.to_location_id && <p className="text-xs text-destructive">{errors.to_location_id}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="quantity">Jumlah Unit / Kuantitas</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            value={data.quantity}
                            onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                            className="bg-background border-border"
                        />
                        {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes">Catatan / Alasan Transfer (Opsional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Contoh: Replenishment rak picking bulanan, atau pemindahan barang retur..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="bg-background border-border min-h-[80px]"
                        />
                    </div>

                    <DialogFooter className="pt-4 border-t border-border gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Memproses...' : 'Eksekusi Transfer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
