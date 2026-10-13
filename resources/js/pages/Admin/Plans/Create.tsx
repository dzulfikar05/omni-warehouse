import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function PlanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
        desc: '',
        features: [''],
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/plans');
    };

    return (
        <>
            <Head title="Add New Plan" />
            <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6 text-foreground">
                <div className="flex items-center gap-3">
                    <Link href="/admin/plans" className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Add New Plan</h1>
                        <p className="text-xs text-muted-foreground">Buat tier paket langganan baru beserta daftar fiturnya.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider">Nama Paket</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Ultra Warehouse"
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
                            placeholder="750000"
                            className="h-10 px-3 bg-background border border-border rounded-lg text-xs"
                        />
                        {errors.price && <span className="text-xs text-destructive">{errors.price}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider">Deskripsi Singkat</label>
                        <textarea
                            value={data.desc}
                            onChange={(e) => setData('desc', e.target.value)}
                            placeholder="Penjelasan singkat mengenai paket..."
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
                                    placeholder="Contoh: Multi-warehouse (up to 5 facilities)"
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
                            Simpan Paket
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

PlanCreate.layout = (page: React.ReactNode) => <AppLayout children={page} breadcrumbs={[{ title: 'Plans Management', href: '/admin/plans' }]} />;