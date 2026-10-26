import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';import { useTranslation } from '@/context/language-context';

import { ArrowLeftCircleIcon, Save } from 'lucide-react';

export default function CategoryCreate() {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        desc: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/inventory/categories`);
    };

    return (
        <>
            <Head title={t("Create Category")} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Card */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {t("Add New Category")}</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("Create a new product classification for inventory management.")}</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/inventory/categories`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> {t("Back")}</Link>
                    </Button>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                {t("Category Name")}{' '}<span className="text-red-500">{t("*")}</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t("e.g. Footwear, Electronics")}
                                required
                                className="h-10 text-xs border-border bg-background rounded-xl"
                            />
                            {errors.name && (
                                <span className="text-xs text-destructive">{errors.name}</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="desc" className="text-xs font-semibold">
                                {t("Description")}</Label>
                            <Textarea
                                id="desc"
                                rows={3}
                                value={data.desc}
                                onChange={(e) => setData('desc', e.target.value)}
                                placeholder={t("Write category notes or summary...")}
                                className="text-xs border-border bg-background rounded-xl p-3"
                            />
                            {errors.desc && (
                                <span className="text-xs text-destructive">{errors.desc}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? t("Saving...") : t("Save Category")}
                            </Button>
                            <Button asChild variant="ghost" className="rounded-xl text-xs">
                                <Link href={`/${tenantSlug}/inventory/categories`}>{t("Cancel")}</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CategoryCreate.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Categories", href: '#' },
        { title: "Create Category", href: '#' },
    ],
};
