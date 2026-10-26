import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/context/language-context';
import { useCurrentUrl } from '@/hooks/use-current-url';
import AppLayout from '@/layouts/app-layout';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/tenant/appearance';
import { edit as editLanguage } from '@/routes/tenant/language';
import { edit } from '@/routes/tenant/profile';
import { edit as editSecurity } from '@/routes/tenant/security';
import type { NavItem } from '@/types';

export default function TenantSettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useTranslation();
    const { auth, current_tenant } = usePage().props as any;

    // Resolusi tenant_slug dari Inertia props dengan fallback teraman
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || '';

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: edit({ tenant_slug: tenantSlug }),
            icon: null,
        },
        {
            title: 'Security',
            href: editSecurity({ tenant_slug: tenantSlug }),
            icon: null,
        },
        {
            title: 'Appearance',
            href: editAppearance({ tenant_slug: tenantSlug }),
            icon: null,
        },
        {
            title: 'Language',
            href: editLanguage({ tenant_slug: tenantSlug }),
            icon: null,
        },
    ];

    return (
        <AppLayout>
            <div className="px-4 py-6">
                <Heading
                    title={t('Settings')}
                    description={t('Manage your profile and account settings')}
                />

                <div className="flex flex-col lg:flex-row lg:space-x-12">
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav
                            className="flex flex-col space-y-1 space-x-0"
                            aria-label={t('Settings')}
                        >
                            {sidebarNavItems.map((item, index) => (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted': isCurrentOrParentUrl(item.href),
                                    })}
                                >
                                    <Link href={item.href}>
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {t(item.title)}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 lg:hidden" />

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-12">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
