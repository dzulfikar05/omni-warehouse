import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircleIcon, Edit3, Ruler, Calendar, Tag } from 'lucide-react';
import { usePermission } from '@/utils/permission';
import { UnitItem } from './Index';

export default function UnitShow({ unit }: { unit: UnitItem }) {
    const { current_tenant, auth } = usePage().props as any;
    const { can } = usePermission();

    const currentPathSlug = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const canEdit = can('tenant.units.edit') || can('units.edit');

    return (
        <>
            <Head title={`Unit Details - ${unit.name}`} />

            <div className="space-y-6 p-4 sm:p-6 font-sans">
                {/* Header Card */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Unit Details: <span className="text-blue-600">{unit.name}</span>
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            View details and measurement symbol for this unit.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/inventory/units`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md gap-1.5">
                                <Link href={`/${tenantSlug}/inventory/units/${unit.id}/edit`}>
                                    <Edit3 className="h-4 w-4" /> Edit Unit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 text-xs text-card-foreground">
                    <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-600" /> Unit Overview
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Unit ID:</span>
                            <strong className="text-blue-600 font-mono text-sm">UNIT-00{unit.id}</strong>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Symbol Notation:</span>
                            <span className="px-2.5 py-0.5 bg-muted font-mono font-bold rounded-lg text-foreground">
                                {unit.symbol}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-muted-foreground block text-[11px]">Full Name:</span>
                        <strong className="text-foreground text-sm font-semibold">{unit.name}</strong>
                    </div>

                    <div className="p-4 bg-muted/40 border border-border rounded-xl mt-4">
                        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Date Created:
                            </span>
                            <span className="font-mono text-foreground font-semibold">
                                {new Date(unit.created_at).toLocaleDateString('en-GB')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

UnitShow.layout = {
    breadcrumbs: [
        { title: 'Inventory Management', href: '#' },
        { title: 'Units', href: '#' },
        { title: 'Unit Details', href: '#' },
    ],
};
