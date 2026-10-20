import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Plus, Trash2, Save, RotateCcw } from 'lucide-react';

export default function PlanCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
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

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Add New Plan"
                    description="Create a new subscription tier along with feature limits."
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/admin/plans">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 p-6 border-b border-border">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Plan Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Enterprise Warehouse"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Price Monthly (IDR) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="750000"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.price && <span className="text-[11px] text-red-500">{errors.price}</span>}
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-foreground">Short Description</label>
                                    <textarea
                                        value={data.desc}
                                        onChange={(e) => setData('desc', e.target.value)}
                                        rows={3}
                                        placeholder="Brief description of plan tier capabilities..."
                                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    />
                                    {errors.desc && <span className="text-[11px] text-red-500">{errors.desc}</span>}
                                </div>
                            </div>

                            {/* Features Input Section */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Feature List
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addFeatureField}
                                        className="h-8 gap-1 border-border text-xs"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Feature
                                    </Button>
                                </div>

                                {data.features.map((feat, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={feat}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g. Multi-warehouse (up to 5 facilities)"
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
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700"
                            >
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? 'Saving...' : 'Save Plan Tier'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

PlanCreate.layout = {
    breadcrumbs: [
        { title: 'Admin', href: '#' },
        { title: 'Plans Management', href: '/admin/plans' },
        { title: 'Add Plan Tier', href: '#' },
    ],
};
