import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    AlertTriangle,
    X,
} from 'lucide-react';

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
    const { t } = useTranslation();
    const { can } = usePermission();
    const { data, setData, put, processing, errors, reset } = useForm({
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
        put(`/plans/${plan.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/plans/${plan.id}`, {
            onFinish: () => setIsDeleting(false),
        });
    };

    const canDelete = can('central.plans.delete');

    return (
        <>
            <Head title={`Edit Plan - ${plan.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={`Edit Plan: ${plan.name}`}
                    description={t("Update plan tier pricing, features, and active settings.")}
                    renderAction={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                                <Link href="/plans">
                                    <ArrowLeft className="h-4 w-4" /> {t("Back")}</Link>
                            </Button>

                            {canDelete && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" /> {t("Delete Plan")}</Button>
                            )}
                        </div>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <form onSubmit={handleUpdate}>
                        <div className="space-y-6 p-6 border-b border-border">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        {t("Plan Name")}{' '}<span className="text-red-500">{t("*")}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        {t("Price Monthly (IDR)")}{' '}<span className="text-red-500">{t("*")}</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.price && <span className="text-[11px] text-red-500">{errors.price}</span>}
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-foreground">{t("Short Description")}</label>
                                    <textarea
                                        value={data.desc}
                                        onChange={(e) => setData('desc', e.target.value)}
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.desc && <span className="text-[11px] text-red-500">{errors.desc}</span>}
                                </div>
                            </div>

                            {/* Features Input Section */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {t("Feature List")}</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addFeatureField}
                                        className="h-8 gap-1 border-border text-xs"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> {t("Add Feature")}</Button>
                                </div>

                                {data.features.map((feat, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={feat}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeFeatureField(index)}
                                            className="h-9 w-9 shrink-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 bg-muted/30 p-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={processing}
                                onClick={() => reset()}
                                className="h-9 gap-1.5 border-border text-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> {t("Reset")}</Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700"
                            >
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? t("Updating...") : t("Update Plan Tier")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <button onClick={() => setShowDeleteModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-base font-bold text-foreground">{t("Delete Plan Tier \"")}{plan.name}{t("\"?")}</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {t("Permanent action. The subscription tier and all embedded feature definitions will be removed from the system catalog.")}</p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isDeleting}
                                onClick={() => setShowDeleteModal(false)}
                                className="h-9 border-border text-xs"
                            >
                                {t("Cancel")}</Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={isDeleting}
                                onClick={handleDelete}
                                className="h-9 bg-red-600 text-white hover:bg-red-700"
                            >
                                {isDeleting ? t("Deleting...") : t("Yes, Delete Plan")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

PlanEdit.layout = {
    breadcrumbs: [
        { title: "Admin", href: '#' },
        { title: "Plans Management", href: '/plans' },
        { title: "Edit Plan Tier", href: '#' },
    ],
};
