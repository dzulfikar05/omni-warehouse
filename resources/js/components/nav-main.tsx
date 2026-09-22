import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items?: NavItem[] }) {
    const { url } = usePage();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = Boolean(item.children && item.children.length > 0);

                    const isParentActive =
                        url.startsWith(String(item.href)) ||
                        Boolean(item.children?.some((child) => url.startsWith(String(child.href))));

                    if (hasChildren) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isParentActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.children?.map((subItem) => {
                                                const isChildActive = url.startsWith(String(subItem.href));

                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isChildActive}
                                                        >
                                                            <Link href={subItem.href}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    const isSingleActive = url.startsWith(String(item.href));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isSingleActive}
                                tooltip={item.title}
                            >
                                <Link href={item.href}>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
