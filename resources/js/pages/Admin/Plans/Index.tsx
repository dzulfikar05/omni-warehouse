import React, { useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';
import {
    Plus,
    CheckCircle2,
    Users,
    Edit,
    ShieldCheck,
    Layers,
    Sparkles,
    CreditCard,
    Check,
} from 'lucide-react';

interface PlanFeature {
    id: number;
    feature_key: string;
    value: string;
}

interface Plan {
    id: number;
    name: string;
    slug: string;
    desc?: string;
    price: number;
    is_active: boolean;
    features: PlanFeature[];
    subscriptions_count?: number;
}

interface Props {
    plans: Plan[];
}

export default function PlanIndex({ plans }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as any;
    const { can } = usePermission();

    const lastShownFlash = useRef<string | null>(null);

    useEffect(() => {
        if (flash?.success && lastShownFlash.current !== flash.success) {
            toast.success(flash.success);
            lastShownFlash.current = flash.success;
        }
    }, [flash?.success]);

    const formatRupiah = (amount: number) => {
        if (amount >= 1000000) {
            const formatted = amount / 1000000;
            return `IDR ${formatted % 1 === 0 ? formatted : formatted.toFixed(1).replace('.', ',')}jt`;
        }
        return `IDR ${(amount / 1000).toLocaleString('id-ID')}k`;
    };

    // Calculation for Stat Cards
    const totalPlans = plans?.length || 0;
    const activePlans = plans?.filter((p) => p.is_active)?.length || 0;
    const freeStarterPlans = plans?.filter((p) => Number(p.price) === 0)?.length || 0;
    const totalSubscriptions = plans?.reduce((acc, p) => acc + (p.subscriptions_count || 0), 0) || 0;

    const canCreate = can('central.plans.create');
    const canEdit = can('central.plans.edit');

    return (
        <>
            <Head title={t("Plans & Features")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Plans & Features")}
                    description={t("Manage subscription tiers, feature flags, and pricing modules for all system tenants.")}
                    renderAction={
                        canCreate && (
                            <Button asChild className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                                <Link href="/admin/plans/create">
                                    <Plus className="mr-1.5 h-4 w-4" /> {t("Add New Plan")}</Link>
                            </Button>
                        )
                    }
                />

                {/* Section Cards KPI */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Total Tiers")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-foreground">{totalPlans}</h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <Layers size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Active Tiers")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {activePlans}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Starter / Free Tiers")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {freeStarterPlans}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50">
                            <Sparkles size={22} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">{t("Active Subscriptions")}</p>
                            <h3 className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totalSubscriptions}
                            </h3>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                            <CreditCard size={22} />
                        </div>
                    </div>
                </div>

                {/* Main Catalog Container */}
                <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div>
                        <h2 className="text-sm font-bold tracking-tight text-foreground">{t("Preview Catalog Plans")}</h2>
                        <p className="text-xs text-muted-foreground">
                            {t("Active subscription packages displayed during tenant registration and upgrades.")}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {plans && plans.length > 0 ? (
                            plans.map((plan, index) => {
                                const isFeatured = index === 1 || plan.slug === 'pro-warehouse';

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                                            isFeatured
                                                ? 'scale-[1.02] border-blue-500 bg-card shadow-lg ring-2 ring-blue-500/20'
                                                : 'border-border bg-card hover:border-border/80'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-5">
                                            <div className="flex flex-col gap-1">
                                                <h3
                                                    className={`text-sm font-bold ${
                                                        isFeatured
                                                            ? 'text-blue-600 dark:text-blue-400'
                                                            : 'text-foreground'
                                                    }`}
                                                >
                                                    {plan.name}
                                                </h3>
                                                <p className="min-h-[32px] text-xs leading-relaxed text-muted-foreground">
                                                    {plan.desc || t("Warehouse inventory and logistics management tier.")}
                                                </p>
                                            </div>

                                            {/* Price Badge */}
                                            <div
                                                className={`flex items-baseline gap-1.5 rounded-xl border p-4 ${
                                                    isFeatured
                                                        ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20'
                                                        : 'border-border/60 bg-muted/40'
                                                }`}
                                            >
                                                <span className="text-xl font-extrabold tracking-tight text-foreground">
                                                    {formatRupiah(Number(plan.price))}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground">{t("/ month")}</span>
                                            </div>

                                            {/* Features List */}
                                            <div className="flex flex-col gap-2.5 pt-2">
                                                {plan.features && plan.features.length > 0 ? (
                                                    plan.features.map((feat) => (
                                                        <div
                                                            key={feat.id}
                                                            className="flex items-start gap-2.5 text-xs text-foreground"
                                                        >
                                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                                            <span className="leading-tight">{feat.value}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs italic text-muted-foreground">
                                                        {t("No features configured.")}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
                                            <div
                                                className={`flex items-center justify-between rounded-lg p-2.5 text-xs ${
                                                    isFeatured
                                                        ? 'bg-blue-50/60 font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                <span>{t("Active Tenants")}</span>
                                                <span className="flex items-center gap-1 font-semibold">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {plan.subscriptions_count || 0} {t("tenants")}</span>
                                            </div>

                                            {canEdit && (
                                                <Button
                                                    asChild
                                                    variant={isFeatured ? 'default' : 'outline'}
                                                    className={`h-9 w-full text-xs font-semibold ${
                                                        isFeatured
                                                            ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                                                            : 'border-border text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    <Link href={`/admin/plans/${plan.id}/edit`}>
                                                        <Edit className="mr-1.5 h-3.5 w-3.5" /> {t("Edit Plan Details")}</Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-3 py-12 text-center text-muted-foreground">
                                <ShieldCheck className="mx-auto mb-2 h-8 w-8 stroke-1 text-muted-foreground" />
                                <p className="text-xs font-medium">{t("No subscription plan tiers available.")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

PlanIndex.layout = {
    breadcrumbs: [
        { title: "Admin", href: '#' },
        { title: "Plans Management", href: '/admin/plans' },
    ],
};
