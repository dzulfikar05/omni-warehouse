import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BookOpen,
    Building2,
    FolderGit2,
    LayoutGrid,
    Settings,
    Users,
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

    // Helper Spatie
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
        // ----------------------------------------------------
        // TENANT WORKSPACE NAVIGATION (Disaring dengan tenant.*)
        // ----------------------------------------------------

        // 1. Dashboard Tenant
        if (can('tenant.dashboard.view') || true) {
            mainNavItems.push({
                title: 'Dashboard',
                href: activeTenantSlug ? `/${activeTenantSlug}/dashboard` : '/dashboard',
                icon: LayoutGrid,
            });
        }

        // 2. Warehouse & Stocks
        const warehouseChildren = [];
        if (can('tenant.warehouses.view')) {
            warehouseChildren.push({
                title: 'Warehouses',
                href: activeTenantSlug ? `/${activeTenantSlug}/warehouses` : '#',
            });
        }
        if (can('tenant.stock_locations.view')) {
            warehouseChildren.push({
                title: 'Rack & Stock Location',
                href: activeTenantSlug ? `/${activeTenantSlug}/stock-locations` : '#',
            });
        }
        if (can('tenant.stock_opname.view')) {
            warehouseChildren.push({
                title: 'Stock Opname',
                href: activeTenantSlug ? `/${activeTenantSlug}/stock-opname` : '#',
            });
        }

        if (warehouseChildren.length > 0) {
            mainNavItems.push({
                title: 'Warehouse & Stocks',
                href: warehouseChildren[0].href,
                icon: Building2,
                children: warehouseChildren,
            });
        }

        // 3. Transactions
        const transactionChildren = [];
        if (can('tenant.inbound.view')) {
            transactionChildren.push({
                title: 'Inbound Management',
                href: activeTenantSlug ? `/${activeTenantSlug}/transactions/inbound` : '#',
            });
        }
        if (can('tenant.outbound.view')) {
            transactionChildren.push({
                title: 'Outbound Management',
                href: activeTenantSlug ? `/${activeTenantSlug}/transactions/outbound` : '#',
            });
        }
        if (can('tenant.stock_transfer.view')) {
            transactionChildren.push({
                title: 'Stock Transfer',
                href: activeTenantSlug ? `/${activeTenantSlug}/transactions/stock-transfer` : '#',
            });
        }

        if (transactionChildren.length > 0) {
            mainNavItems.push({
                title: 'Transaction',
                href: transactionChildren[0].href,
                icon: ArrowLeftRight,
                children: transactionChildren,
            });
        }

        // 4. Contact
        const contactChildren = [];
        if (can('tenant.contacts.customers.view')) {
            contactChildren.push({
                title: 'Customer',
                href: activeTenantSlug ? `/${activeTenantSlug}/contacts/customers` : '#',
            });
        }
        if (can('tenant.contacts.suppliers.view')) {
            contactChildren.push({
                title: 'Supplier',
                href: activeTenantSlug ? `/${activeTenantSlug}/contacts/suppliers` : '#',
            });
        }

        if (contactChildren.length > 0) {
            mainNavItems.push({
                title: 'Contact',
                href: contactChildren[0].href,
                icon: Users,
                children: contactChildren,
            });
        }

        // 5. Tenant Settings
        const settingsChildren = [];
        if (can('tenant.company_profile.view')) {
            settingsChildren.push({
                title: 'Company Profile',
                href: activeTenantSlug ? `/${activeTenantSlug}/settings/company-profile` : '#',
            });
        }
        if (can('tenant.users.view') || can('tenant.roles.view')) {
            settingsChildren.push({
                title: 'User & Roles',
                href: activeTenantSlug ? `/${activeTenantSlug}/settings/users-roles` : '#',
            });
        }

        if (settingsChildren.length > 0) {
            mainNavItems.push({
                title: 'Settings',
                href: settingsChildren[0].href,
                icon: Settings,
                children: settingsChildren,
            });
        }

    } else {
        // ----------------------------------------------------
        // CENTRAL PLATFORM NAVIGATION (Disaring dengan central.*)
        // ----------------------------------------------------
        if (can('central.dashboard.view') || hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            });
        }

        if (can('central.tenants.view') || hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Tenants',
                href: '/admin/tenants',
                icon: Building2,
            });
        }

        if (can('central.users.view') || hasRole('superadmin')) {
            mainNavItems.push({
                title: 'Users',
                href: '/users',
                icon: UsersRound,
            });
        }

        if (can('central.roles.view') || hasRole('superadmin')) {
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
