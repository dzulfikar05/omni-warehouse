import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    const { auth, current_tenant } = usePage().props as any;
    const userTenantId = auth?.user?.tenant_id;
    const currentPathSlug = window.location.pathname.split('/')[1];

    // Deteksi tenant slug yang sedang aktif
    const activeTenantSlug =
        current_tenant?.slug ||
        auth?.user?.tenant?.slug ||
        (userTenantId ? currentPathSlug : null);

    // Buat URL Logout dan Settings secara dinamis
    const logoutUrl = activeTenantSlug ? `/${activeTenantSlug}/logout` : '/logout';
    const settingsUrl = activeTenantSlug ? `/${activeTenantSlug}/settings/profile` : '/settings/profile';

    if (!auth?.user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent
                            user={auth.user}
                            logoutUrl={logoutUrl}
                            settingsUrl={settingsUrl}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
