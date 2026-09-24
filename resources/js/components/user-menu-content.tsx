import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';

interface UserMenuContentProps {
    user: any;
    logoutUrl?: string;
    settingsUrl?: string;
}

export function UserMenuContent({
    user,
    logoutUrl = '/logout',
    settingsUrl = '/settings/profile',
}: UserMenuContentProps) {
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        href={settingsUrl}
                        className="flex w-full items-center gap-2 cursor-pointer"
                    >
                        <Settings className="size-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-red-600 focus:text-red-600 cursor-pointer">
                <Link
                    href={logoutUrl}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-2"
                >
                    <LogOut className="size-4" />
                    <span>Log out</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
}
