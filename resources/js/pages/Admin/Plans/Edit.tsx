import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Trash2,
    ArrowLeftCircleIcon,
    AlertTriangle,
    X,
    Save,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Feature {
    id?: number;
    value: string;
}

interface Plan {
    id: number;
    name: string;
    desc?: string;
    price: number;
    features: Feature[];
}

interface Props {
    plan: Plan;
}

export default function PlanEdit({ plan }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.name || '',
        price: plan.price || '',
        desc: plan.desc || '',
        features:
            plan.features.length > 0
                ? plan.features.map((f) => f.value)
                : [''],
    });

    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const addFeatureField = () => {
        setData('features', [...data.features, '']);
    };

    const removeFeatureField = (index: number) => {
        const updated = data.features.filter((_, i) => i !== index);
        setData('features', updated);
    };

    const handleFeatureChange = (index: number, value: string) => {
        const updated = [...data.features];
        updated[index] = value;
        setData('features', updated);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/plans/${plan.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(`/admin/plans/${plan.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title={`Edit Plan - ${plan.name}`} />

            <div className="space-y-6 p-4">
                {/* Header Card */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground border border-border p-6 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button asChild variant="outline" size="icon">
                                <Link href="/admin/plans">
                                    <ArrowLeftCircleIcon className="h-4 w-4" />
                                </Link>
                            </Button>

                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    Edit Plan: {plan.name}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Perbarui informasi detail paket dan fiturnya.
                                </p>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-1.5"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Plan
                        </Button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground border border-border p-6 shadow-md">
                    <form
                        onSubmit={handleUpdate}
                        className="max-w-xl space-y-4"
                    >
                        {/* Nama Paket */}
                        <div className="space-y-1">
                            <Label htmlFor="name">Nama Paket</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Contoh: Ultra Warehouse"
                            />
                            {errors.name && (
                                <span className="text-sm text-red-500">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        {/* Harga per Bulan */}
                        <div className="space-y-1">
                            <Label htmlFor="price">
                                Harga per Bulan (IDR)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                placeholder="750000"
                            />
                            {errors.price && (
                                <span className="text-sm text-red-500">
                                    {errors.price}
                                </span>
                            )}
                        </div>

                        {/* Deskripsi Singkat */}
                        <div className="space-y-1">
                            <Label htmlFor="desc">Deskripsi Singkat</Label>
                            <textarea
                                id="desc"
                                value={data.desc}
                                onChange={(e) =>
                                    setData('desc', e.target.value)
                                }
                                placeholder="Penjelasan singkat mengenai paket..."
                                rows={3}
                                className="w-full p-3 bg-background border border-input rounded-md text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            {errors.desc && (
                                <span className="text-sm text-red-500">
                                    {errors.desc}
                                </span>
                            )}
                        </div>

                        {/* Daftar Fitur */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between gap-3">
                                <Label>Daftar Fitur (Features)</Label>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addFeatureField}
                                    className="h-8 px-3 text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Tambah Fitur
                                </Button>
                            </div>

                            {data.features.map((feat, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        type="text"
                                        value={feat}
                                        onChange={(e) =>
                                            handleFeatureChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Contoh: Multi-warehouse (up to 5 facilities)"
                                    />

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() =>
                                            removeFeatureField(index)
                                        }
                                        className="h-9 w-9 shrink-0"
                                        aria-label={`Hapus fitur ${index + 1}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={processing}
                            >
                                <Save className="h-4 w-4" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Perbarui Paket'}
                            </Button>

                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <Link href="/admin/plans">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowDeleteModal(false)}
                                aria-label="Tutup dialog"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-foreground">
                                Hapus Paket "{plan.name}"?
                            </h3>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Tindakan ini bersifat permanen. Paket
                                langganan beserta seluruh fitur di dalamnya
                                akan dihapus dari sistem.
                            </p>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Batal
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full sm:w-auto"
                                disabled={isDeleting}
                                onClick={handleDelete}
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

PlanEdit.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={[
            {
                title: 'Plans Management',
                href: '/admin/plans',
            },
            {
                title: 'Edit Plan',
                href: '/admin/plans',
            },
        ]}
    />
);
