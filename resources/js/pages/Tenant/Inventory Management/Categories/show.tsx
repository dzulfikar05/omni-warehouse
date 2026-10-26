import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';import { useTranslation } from '@/context/language-context';


interface Category {
    id: number;
    name: string;
    desc?: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    tenant_slug: string;
    category: Category;
}

export default function Show({
    tenant_slug,
    category,
}: Props) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={`Category - ${category.name}`} />

            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t("Category Details")}</h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("View category information.")}</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Category ID")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {t("CAT-00")}{category.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Category Name")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {category.name}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">
                                {t("Description")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {category.desc || t("No description provided.")}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Date Added")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    category.created_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t("Last Updated")}</p>

                            <p className="mt-1 font-medium text-foreground">
                                {new Date(
                                    category.updated_at,
                                ).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/categories`}
                            >
                                {t("Back")}</Link>
                        </Button>

                        <Button asChild>
                            <Link
                                href={`/${tenant_slug}/inventory/categories/${category.id}/edit`}
                            >
                                {t("Edit Category")}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: "Inventory Management", href: '/categories' },
        { title: "Categories", href: '/categories' },
        { title: "Category Details", href: '#' },
    ],
};