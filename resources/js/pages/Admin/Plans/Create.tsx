import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeftCircleIcon,
    Plus,
    Trash2,
    Save,
} from 'lucide-react';
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

            <div className="space-y-6 p-4">
                {/* Header Card */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground border border-border p-6 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                Add New Plan
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Buat tier paket langganan baru beserta daftar fiturnya.
                            </p>
                        </div>

                        <Button asChild variant="outline">
                            <Link href="/admin/plans">
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground border border-border p-6 shadow-md">
                    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                        {/* Nama Paket */}
                        <div className="space-y-1">
                            <Label htmlFor="name">Nama Paket</Label>
                            <Input
                                id="name"
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
                                    <Plus className="w-3.5 h-3.5 mr-1" />
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
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={processing}
                            >
                                <Save className="h-4 w-4" />
                                {processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Paket'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

PlanCreate.layout = (page: React.ReactNode) => (
    <AppLayout
        children={page}
        breadcrumbs={[
            {
                title: 'Plans Management',
                href: '/admin/plans',
            },
            {
                title: 'Create Plan',
                href: '/admin/plans/create',
            },
        ]}
    />
);