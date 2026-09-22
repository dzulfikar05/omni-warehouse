import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    FolderGit2,
    LayoutGrid,
    Settings,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth, current_tenant } = usePage().props as any;

    const userPermissions: string[] = auth?.user?.permissions || [];
    const userRoles: string[] = auth?.user?.roles || [];
    const userTenantId = auth?.user?.tenant_id;

    const can = (permission: string) => userPermissions.includes(permission);
    const hasRole = (role: string) => userRoles.includes(role);

    const mainNavItems: NavItem[] = [];

    const currentPathSlug = window.location.pathname.split('/')[1];
    const activeTenantSlug =
        current_tenant?.slug || (userTenantId ? currentPathSlug : null);

    const isTenantUser = Boolean(current_tenant || userTenantId);

    const activeTenantName =
        current_tenant?.name ||
        auth?.user?.tenant_name ||
        auth?.user?.tenant?.name ||
        'Tenant Portal';

    if (isTenantUser) {
        mainNavItems.push({
            title: 'Dashboard',
            href: activeTenantSlug
                ? `/${activeTenantSlug}/dashboard`
                : '/dashboard',
            icon: LayoutGrid,
        });

        mainNavItems.push({
            title: 'Settings',
            href: activeTenantSlug ? `/${activeTenantSlug}/settings/company-profile` : '#',
            icon: Settings,
            children: [
                {
                    title: 'Company Profile',
                    href: activeTenantSlug ? `/${activeTenantSlug}/settings/company-profile` : '#',
                },
                {
                    title: 'User & Roles',
                    href: activeTenantSlug ? `/${activeTenantSlug}/settings/users-roles` : '#',
                },
            ],
        });
    } else {
        if (can('dashboard.view') || hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            });
        }

        if (hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Tenants',
                href: '/admin/tenants',
                icon: Building2,
            });
        }

        if (can('users.view') || hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Users',
                href: '/users',
                icon: UsersRound,
            });
        }

        if (can('roles.view') || hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Roles & Permissions',
                href: '/roles',
                icon: FolderGit2,
            });
        }
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/dzulfikar05/omni-warehouse',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={
                                    activeTenantSlug
                                        ? `/${activeTenantSlug}/dashboard`
                                        : '/dashboard'
                                }
                                prefetch
                            >
                                <AppLogo
                                    size="sm"
                                    tenantName={
                                        isTenantUser
                                            ? activeTenantName
                                            : 'OmniWarehouse'
                                    }
                                />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
