import { Head, Link } from '@inertiajs/react';
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

export default function Show({ role }: { role: Role }) {
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        role.permissions?.forEach((perm) => {
            const parts = perm.name.split('.');
            const groupName = parts.slice(0, parts.length - 1).join(' ');

            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(perm);
        });
        return groups;
    }, [role.permissions]);

    const getPermissionActionLabel = (permName: string) => {
        const parts = permName.split('.');
        return parts[parts.length - 1].replace(/_/g, ' ');
    };

    return (
        <>
            <Head title={`Role Details - ${role.name}`} />

            <div className="space-y-6 p-4">
                <div className="mx-auto rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Role Details</h2>
                            <p className="text-sm text-muted-foreground">Viewing Central Admin privileges mapped to this role</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/roles">
                                    <ArrowLeftCircleIcon className="mr-2 h-4 w-4" /> Back
                                </Link>
                            </Button>
                            <Button asChild variant="default" className="shadow-sm">
                                <Link href={`/roles/${role.id}/edit`}>
                                    <PencilIcon className="mr-2 h-4 w-4" /> Edit Role
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="space-y-8">
                        <div className="grid gap-1 border-b border-border pb-4">
                            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Role Name</Label>
                            <p className="text-2xl font-black text-foreground capitalize tracking-tight">
                                {role.name}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest block">
                                Attached Permissions ({role.permissions?.length || 0})
                            </Label>

                            {Object.keys(groupedPermissions).length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                                        <div key={groupName} className="rounded-xl border border-border bg-muted/50 p-4">
                                            <h3 className="text-xs font-bold text-primary uppercase mb-3 border-b border-border pb-1.5 capitalize">
                                                {groupName.replace(/_/g, ' ')}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {perms.map((perm) => (
                                                    <Badge
                                                        key={perm.id}
                                                        variant="outline"
                                                        className="bg-card border-border text-foreground font-medium capitalize"
                                                    >
                                                        {getPermissionActionLabel(perm.name)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                                    <p className="text-sm text-muted-foreground italic">No permissions attached to this role.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Roles', href: '/roles' },
        { title: 'View Details', href: '#' },
    ],
};
