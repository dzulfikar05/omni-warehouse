import { Head } from '@inertiajs/react';

import UnitForm from './components/UnitForm';

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
    return (
        <>
            <Head title="Edit Unit" />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Edit Unit
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update unit information.
                    </p>
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
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Units', href: '/units' },
        { title: 'Edit Unit', href: '#' },
    ],
};