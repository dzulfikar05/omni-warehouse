import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeftCircleIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Permission {
    id: number;
    name: string;
}

export default function CreateRole({ permissions = [] }: { permissions: Permission[] }) {
    const { current_tenant, auth } = usePage().props as any;
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach((perm) => {
            const groupName = perm.name.split('.')[0];
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(perm);
        });
        return groups;
    }, [permissions]);

    const toggleAccordion = (groupName: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    const toggleGroup = (groupName: string, isChecked: boolean) => {
        const groupPermNames = groupedPermissions[groupName].map((p) => p.name);
        let newPermissions = [...data.permissions];

        if (isChecked) {
            groupPermNames.forEach((name) => {
                if (!newPermissions.includes(name)) newPermissions.push(name);
            });
        } else {
            newPermissions = newPermissions.filter((name) => !groupPermNames.includes(name));
        }
        setData('permissions', newPermissions);
    };

    const handleCheckboxChange = (permissionName: string) => {
        const current = [...data.permissions];
        const index = current.indexOf(permissionName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permissionName);
        }
        setData('permissions', current);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/settings/roles`);
    };

    return (
        <>
            <Head title="Create Tenant Role" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Create New Role</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Define custom operational capabilities for this tenant organization.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/settings/users-roles?tab=roles`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={submit} className="max-w-4xl space-y-6">
                        <div className="max-w-xl space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Role Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Supervisor Gudang"
                                className="h-10 text-xs border-border bg-background rounded-xl"
                            />
                            {errors.name && (
                                <span className="text-xs font-medium text-destructive">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-bold tracking-tight">Assign Permissions</Label>

                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                                    const isExpanded = !!openGroups[groupName];
                                    const isAllGroupChecked = perms.every((p) =>
                                        data.permissions.includes(p.name)
                                    );

                                    return (
                                        <div
                                            key={groupName}
                                            className="overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all"
                                        >
                                            <div className="flex items-center justify-between bg-muted/50 p-4">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleAccordion(groupName)}
                                                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                                                        {groupName} Management
                                                    </h3>
                                                </div>

                                                <div className="flex items-center space-x-2 rounded-lg border border-border bg-card px-3 py-1">
                                                    <Checkbox
                                                        id={`all-${groupName}`}
                                                        checked={isAllGroupChecked}
                                                        onCheckedChange={(checked) =>
                                                            toggleGroup(groupName, !!checked)
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`all-${groupName}`}
                                                        className="cursor-pointer text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                                                    >
                                                        Check All
                                                    </label>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="grid grid-cols-1 gap-3 border-t border-border p-5 md:grid-cols-2 lg:grid-cols-3">
                                                    {perms.map((permission) => {
                                                        const isChecked = data.permissions.includes(
                                                            permission.name
                                                        );
                                                        return (
                                                            <div
                                                                key={permission.id}
                                                                className={`flex items-center space-x-3 rounded-xl border p-3 transition-all ${
                                                                    isChecked
                                                                        ? 'border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                                                                        : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    id={`perm-${permission.id}`}
                                                                    checked={isChecked}
                                                                    onCheckedChange={() =>
                                                                        handleCheckboxChange(permission.name)
                                                                    }
                                                                />
                                                                <label
                                                                    htmlFor={`perm-${permission.id}`}
                                                                    className="cursor-pointer text-xs font-medium capitalize"
                                                                >
                                                                    {permission.name.split('.')[1] || permission.name}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20"
                                disabled={processing}
                            >
                                {processing ? 'Saving...' : 'Save Role'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CreateRole.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
        { title: 'Create Role', href: '#' },
    ],
};
