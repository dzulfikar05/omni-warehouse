import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftCircleIcon, PencilIcon } from 'lucide-react';
import { useMemo } from 'react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

export default function ShowRole({ role }: { role: Role }) {
    const { current_tenant, auth } = usePage().props as any;
    // const tenantSlug = current_tenant?.slug || '';
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        role.permissions?.forEach((perm) => {
            const groupName = perm.name.split('.')[0];
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(perm);
        });
        return groups;
    }, [role.permissions]);

    return (
        <>
            <Head title={`Role Details - ${role.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Role Details</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Viewing assigned permissions for this security group
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/settings/users-roles?tab=roles`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 rounded-xl">
                            <Link href={`/${tenantSlug}/settings/roles/${role.id}/edit`}>
                                <PencilIcon className="mr-2 h-3.5 w-3.5" /> Edit Role
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 text-card-foreground">
                    <div className="border-b border-border pb-4">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            Role Name
                        </Label>
                        <p className="text-2xl font-black text-foreground capitalize mt-1">
                            {role.name}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">
                            Attached Permissions ({role.permissions?.length || 0})
                        </Label>

                        {Object.keys(groupedPermissions).length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                                    <div key={groupName} className="rounded-xl border border-border bg-muted/40 p-4">
                                        <h3 className="text-xs font-bold text-blue-600 uppercase mb-3 border-b border-border/60 pb-1.5">
                                            {groupName} Management
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {perms.map((perm) => (
                                                <Badge
                                                    key={perm.id}
                                                    variant="outline"
                                                    className="bg-card border-border text-foreground font-medium capitalize text-xs px-2.5 py-1"
                                                >
                                                    {perm.name.split('.')[1] || perm.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                                <p className="text-xs text-muted-foreground italic">No permissions attached to this role.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ShowRole.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
        { title: 'Role Details', href: '#' },
    ],
};
