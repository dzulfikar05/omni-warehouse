import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';import { useTranslation } from '@/context/language-context';


interface Unit {
    id: number;
    name: string;
    symbol: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    tenant_slug: string;
    unit: Unit;
}

export default function Show({
    tenant_slug,
    unit,
}: Props) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={`Unit - ${unit.name}`} />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("Unit Details")}</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("View unit information.")}</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Unit ID")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {unit.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Unit Name")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {unit.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Unit Symbol")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {unit.symbol}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Date Added")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    unit.created_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Last Updated")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    unit.updated_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/units`}
                            >
                                {t("Back")}</Link>
                        </Button>

                        <Button asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/units/${unit.id}/edit`}
                            >
                                {t("Edit Unit")}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}