import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';import { useTranslation } from '@/context/language-context';

import { ArrowLeftCircleIcon, Save } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface CreateProps {
    categories: Category[];
}

export default function ProductCreate({ categories }: CreateProps) {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        description: '',
        status: 'active',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/inventory/products`);
    };

    return (
        <>
            <Head title={t("Tambah Produk Baru")} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Card */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {t("Tambah Produk Baru")}</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("Buat item produk baru sebagai induk dari beberapa kode varian SKU.")}</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/inventory/products`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> {t("Back")}</Link>
                    </Button>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        {/* Nama Produk */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                {t("Nama Produk")}{' '}<span className="text-red-500">{t("*")}</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t("misal: Sepatu Olahraga Running")}
                                required
                                className="h-10 text-xs border-border bg-background rounded-xl"
                            />
                            {errors.name && (
                                <span className="text-xs text-destructive">{errors.name}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Kategori Select */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category_id" className="text-xs font-semibold">
                                    {t("Kategori Produk")}{' '}<span className="text-red-500">{t("*")}</span>
                                </Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(val) => setData('category_id', val)}
                                >
                                    <SelectTrigger className="h-10 text-xs border-border bg-background rounded-xl">
                                        <SelectValue placeholder={t("Pilih Kategori")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && (
                                    <span className="text-xs text-destructive">{errors.category_id}</span>
                                )}
                            </div>

                            {/* Status Select */}
                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-xs font-semibold">
                                    {t("Status Produk")}{' '}<span className="text-red-500">{t("*")}</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger className="h-10 text-xs border-border bg-background rounded-xl">
                                        <SelectValue placeholder={t("Pilih Status")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">{t("Active")}</SelectItem>
                                        <SelectItem value="inactive">{t("Inactive")}</SelectItem>
                                        <SelectItem value="draft">{t("Draft")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <span className="text-xs text-destructive">{errors.status}</span>
                                )}
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-semibold">
                                {t("Deskripsi Produk")}</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={t("Tambahkan catatan atau deskripsi ringkas...")}
                                className="text-xs border-border bg-background rounded-xl p-3"
                            />
                            {errors.description && (
                                <span className="text-xs text-destructive">{errors.description}</span>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? t("Saving...") : t("Save Product")}
                            </Button>
                            <Button asChild variant="ghost" className="rounded-xl text-xs">
                                <Link href={`/${tenantSlug}/inventory/products`}>{t("Cancel")}</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Products", href: '#' },
        { title: "Tambah Produk", href: '#' },
    ],
};
