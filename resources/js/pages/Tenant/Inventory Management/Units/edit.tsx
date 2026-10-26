import { Head } from '@inertiajs/react';

import UnitForm from './components/UnitForm';import { useTranslation } from '@/context/language-context';


interface Unit {
    id: number;
    name: string;
    symbol: string;
}

interface Props {
    tenant_slug: string;
    unit: Unit;
}

export default function Edit({
    tenant_slug,
    unit,
}: Props) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t("Edit Unit")} />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("Edit Unit")}</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("Update unit information.")}</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <UnitForm
                        tenant_slug={tenant_slug}
                        unit={unit}
                        mode="edit"
                    />
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: "Dashboard", href: '/dashboard' },
        { title: "Units", href: '/units' },
        { title: "Edit Unit", href: '#' },
    ],
};