import { useForm, usePage } from '@inertiajs/react';
import { ClipboardCheck, X, Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
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
import { useTranslation } from '@/context/language-context';
import type { StockOpnameWarehouse } from '@/types/stock-opname';

interface CreateOpnameModalProps {
    isOpen: boolean;
    warehouses: StockOpnameWarehouse[];
    onClose: () => void;
}

export function CreateOpnameModal({
    isOpen,
    warehouses,
    onClose,
}: CreateOpnameModalProps) {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug =
        typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : '';
    const tenantSlug =
        current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;
    const { data, setData, post, processing, errors, reset } = useForm({
        warehouse_id: warehouses[0] ? String(warehouses[0].id) : '',
        location_id: 'all',
        notes: '',
    });

    useEffect(() => {
        if (isOpen && warehouses.length > 0) {
            setData((current) => ({
                ...current,
                warehouse_id: warehouses.some(
                    (warehouse) =>
                        String(warehouse.id) === current.warehouse_id,
                )
                    ? current.warehouse_id
                    : String(warehouses[0].id),
            }));
        }
    }, [isOpen, warehouses, setData]);

    if (!isOpen) {
        return null;
    }

    const selectedWarehouse = warehouses.find(
        (warehouse) => String(warehouse.id) === data.warehouse_id,
    );

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        post(`/${tenantSlug}/stock-opname/sessions`, {
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (formErrors) => {
                toast.error(
                    Object.values(formErrors)[0] ||
                        t('Permintaan gagal diproses.'),
                );
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-opname-title"
                className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl"
            >
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2
                        id="create-opname-title"
                        className="flex items-center gap-2 text-base font-semibold"
                    >
                        <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        {t('Buat sesi opname')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('Tutup')}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    {warehouses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t('Belum ada gudang aktif.')}
                        </p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="opname-warehouse">
                                    {t('Gudang')}
                                </Label>
                                <Select
                                    value={data.warehouse_id}
                                    onValueChange={(value) =>
                                        setData((current) => ({
                                            ...current,
                                            warehouse_id: value,
                                            location_id: 'all',
                                        }))
                                    }
                                >
                                    <SelectTrigger id="opname-warehouse">
                                        <SelectValue
                                            placeholder={t('Pilih gudang')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem
                                                key={warehouse.id}
                                                value={String(warehouse.id)}
                                            >
                                                {warehouse.name} (
                                                {warehouse.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.warehouse_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.warehouse_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opname-location">
                                    {t('Lokasi / Rak')}
                                </Label>
                                <Select
                                    value={data.location_id}
                                    onValueChange={(value) =>
                                        setData('location_id', value)
                                    }
                                >
                                    <SelectTrigger id="opname-location">
                                        <SelectValue
                                            placeholder={t(
                                                'Pilih lokasi / rak',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('Semua lokasi')}
                                        </SelectItem>
                                        {selectedWarehouse?.locations.map(
                                            (location) => (
                                                <SelectItem
                                                    key={location.id}
                                                    value={String(location.id)}
                                                >
                                                    {location.rack_code}
                                                    {location.zone
                                                        ? ` · ${location.zone}`
                                                        : ''}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.location_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.location_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opname-notes">
                                    {t('Catatan')}{' '}
                                    <span className="font-normal text-muted-foreground">
                                        ({t('opsional')})
                                    </span>
                                </Label>
                                <Input
                                    id="opname-notes"
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    maxLength={255}
                                />
                                {errors.notes && (
                                    <p className="text-xs text-destructive">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                    {errors.session && (
                        <p role="alert" className="text-sm text-destructive">
                            {errors.session}
                        </p>
                    )}

                    <footer className="flex justify-end gap-2 border-t border-border pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {t('Batal')}
                        </Button>
                        {warehouses.length > 0 && (
                            <Button
                                type="submit"
                                disabled={processing || !data.warehouse_id}
                                className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                {processing
                                    ? t('Menyimpan...')
                                    : t('Mulai opname')}
                            </Button>
                        )}
                    </footer>
                </form>
            </section>
        </div>
    );
}
