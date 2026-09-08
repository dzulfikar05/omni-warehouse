import { Link, usePage } from '@inertiajs/react'; // Tambahkan usePage
import { BookOpen, FolderGit2, LayoutGrid, UsersRound } from 'lucide-react';
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
import { dashboard } from '@/routes';
import type { NavItem, User } from '@/types'; // Pastikan tipe User menyertakan permissions/roles

export function AppSidebar() {
    // Ambil data auth dari shared props Inertia
    const { auth } = usePage().props as any;

    // Helper untuk mengecek permission
    const can = (permission: string) => auth.user.permissions.includes(permission);
    // Helper untuk mengecek role
    const hasRole = (role: string) => auth.user.roles.includes(role);

    const mainNavItems: NavItem[] = [];

    if (can('dashboard.view')) {
        mainNavItems.push({
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        });
    }

    if (can('users.view')) {
        mainNavItems.push({
            title: 'User',
            href: '/users',
            icon: UsersRound,
        });
    }

    if (hasRole('superadmin') || can('roles.view')) {
        mainNavItems.push({
            title: 'Role',
            href: '/roles',
            icon: FolderGit2,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Kirim mainNavItems yang sudah difilter */}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
