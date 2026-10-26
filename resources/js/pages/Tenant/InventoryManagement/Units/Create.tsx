import React, { FormEvent } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';import { useTranslation } from '@/context/language-context';

import { ArrowLeftCircleIcon, Save } from 'lucide-react';

export default function UnitCreate() {
    const { t } = useTranslation();
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        symbol: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/inventory/units`);
    };

    return (
        <>
            <Head title={t("Create Unit")} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Card */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {t("Add New Measurement Unit")}</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("Define a new standard measurement unit for stock handling.")}</p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/inventory/units`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> {t("Back")}</Link>
                    </Button>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold">
                                    {t("Unit Name")}{' '}<span className="text-red-500">{t("*")}</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t("e.g. Kilogram, Piece")}
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.name && (
                                    <span className="text-xs text-destructive">{errors.name}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="symbol" className="text-xs font-semibold">
                                    {t("Unit Symbol")}{' '}<span className="text-red-500">{t("*")}</span>
                                </Label>
                                <Input
                                    id="symbol"
                                    value={data.symbol}
                                    onChange={(e) => setData('symbol', e.target.value)}
                                    placeholder={t("e.g. kg, pcs")}
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.symbol && (
                                    <span className="text-xs text-destructive">{errors.symbol}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {processing ? t("Saving...") : t("Save Unit")}
                            </Button>
                            <Button asChild variant="ghost" className="rounded-xl text-xs">
                                <Link href={`/${tenantSlug}/inventory/units`}>{t("Cancel")}</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

UnitCreate.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '#' },
        { title: "Units", href: '#' },
        { title: "Create Unit", href: '#' },
    ],
};
