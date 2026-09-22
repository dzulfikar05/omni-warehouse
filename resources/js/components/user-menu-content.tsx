import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import type { User } from '@/types';

interface UserMenuContentProps {
    user: User;
    logoutUrl?: string;
}

export function UserMenuContent({ user, logoutUrl = '/logout' }: UserMenuContentProps) {
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="flex w-full items-center cursor-pointer">
                        <Settings className="mr-2 size-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <Link
                    href={logoutUrl}
                    method="post"
                    as="button"
                    className="flex w-full items-center cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 size-4" />
                    <span>Log out</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
}
