import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Plus, Trash2, ArrowLeft, AlertTriangle, X } from 'lucide-react';
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
        features: plan.features.length > 0 ? plan.features.map(f => f.value) : [''],
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
            <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6 text-foreground">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/plans" className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Edit Plan: {plan.name}</h1>
                            <p className="text-xs text-muted-foreground">Perbarui informasi detail paket dan fiturnya.</p>
                        </div>
                    </div>

                    {/* Tombol Hapus diletakkan di halaman Edit */}
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="h-9 px-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Plan</span>
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider">Nama Paket</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-10 px-3 bg-background border border-border rounded-lg text-xs"
                        />
                        {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider">Harga per Bulan (IDR)</label>
                        <input
                            type="number"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className="h-10 px-3 bg-background border border-border rounded-lg text-xs"
                        />
                        {errors.price && <span className="text-xs text-destructive">{errors.price}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider">Deskripsi Singkat</label>
                        <textarea
                            value={data.desc}
                            onChange={(e) => setData('desc', e.target.value)}
                            className="p-3 bg-background border border-border rounded-lg text-xs min-h-[80px]"
                        />
                        {errors.desc && <span className="text-xs text-destructive">{errors.desc}</span>}
                    </div>

                    <div className="flex flex-col gap-3 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider">Daftar Fitur (Features)</label>
                            <button
                                type="button"
                                onClick={addFeatureField}
                                className="h-8 px-3 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Fitur
                            </button>
                        </div>

                        {data.features.map((feat, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={feat}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    className="h-10 px-3 bg-background border border-border rounded-lg text-xs flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFeatureField(index)}
                                    className="h-10 w-10 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center hover:bg-destructive/20 transition cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Link href="/admin/plans" className="h-9 px-4 bg-muted flex items-center rounded-lg text-xs font-medium">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 cursor-pointer"
                        >
                            Perbarui Paket
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL KONFIRMASI HAPUS */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <button onClick={() => setShowDeleteModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-foreground">Hapus Paket "{plan.name}"?</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Tindakan ini bersifat permanen. Paket langganan beserta seluruh fitur di dalamnya akan dihapus dari sistem.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="h-9 px-4 bg-muted text-foreground rounded-lg text-xs font-medium cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="h-9 px-4 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold cursor-pointer"
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

PlanEdit.layout = (page: React.ReactNode) => <AppLayout children={page} breadcrumbs={[{ title: 'Plans Management', href: '/admin/plans' }]} />;