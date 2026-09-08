import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props as any;
    const permissions = auth.user.permissions || [];

    const can = (permission: string) => permissions.includes(permission);

    return { can };
}
