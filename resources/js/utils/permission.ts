import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props as any;
    const permissions: unknown = auth?.user?.permissions;

    const can = (permission: string) =>
        Array.isArray(permissions) && permissions.includes(permission);

    return { can };
}
