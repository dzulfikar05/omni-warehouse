import { Head, Link, useForm } from '@inertiajs/react';
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

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

export default function Edit({ role, permissions }: { role: Role; permissions: Permission[] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        permissions: role.permissions?.map((p) => p.name) || [],
    });

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Grouping permission per modul/sub-modul secara presisi
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach((perm) => {
            const parts = perm.name.split('.');
            const groupName = parts.slice(0, parts.length - 1).join(' ');

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

    const getPermissionActionLabel = (permName: string) => {
        const parts = permName.split('.');
        return parts[parts.length - 1].replace(/_/g, ' ');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/roles/${role.id}`);
    };

    return (
        <>
            <Head title={`Edit Role - ${role.name}`} />

            <div className="space-y-6 p-4">
                <div className="mx-auto rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">
                        Edit Role: <span className="capitalize">{role.name}</span>
                    </h2>
                    <Button asChild variant="outline">
                        <Link href="/roles">
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="mx-auto rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <form onSubmit={submit} className="max-w-4xl space-y-6">
                        <div className="max-w-xl space-y-1">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. System Administrator"
                            />
                            {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-bold text-foreground">
                                Update Permissions Mapping
                            </Label>

                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                                    const isExpanded = !!openGroups[groupName];
                                    const isAllGroupChecked = perms.every((p) => data.permissions.includes(p.name));

                                    return (
                                        <div key={groupName} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all">
                                            <div className="flex items-center justify-between bg-muted/50 p-4">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleAccordion(groupName)}
                                                        className="rounded-md p-1 hover:bg-muted text-muted-foreground"
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </button>
                                                    <h3 className="font-bold text-foreground capitalize">
                                                        {groupName.replace(/_/g, ' ')}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center space-x-2 bg-card px-3 py-1 rounded-lg border border-border">
                                                    <Checkbox
                                                        id={`all-${groupName}`}
                                                        checked={isAllGroupChecked}
                                                        onCheckedChange={(checked) => toggleGroup(groupName, !!checked)}
                                                    />
                                                    <label htmlFor={`all-${groupName}`} className="cursor-pointer text-[10px] font-bold uppercase text-muted-foreground">
                                                        Check All
                                                    </label>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-3 border-t border-border">
                                                    {perms.map((permission) => {
                                                        const isChecked = data.permissions.includes(permission.name);
                                                        return (
                                                            <div
                                                                key={permission.id}
                                                                className={`flex items-center space-x-3 rounded-xl border p-3 transition-all ${
                                                                    isChecked ? 'bg-primary/10 border-primary/30' : 'border-transparent hover:bg-muted/50'
                                                                }`}
                                                            >
                                                                <Checkbox
                                                                    id={`perm-${permission.id}`}
                                                                    checked={isChecked}
                                                                    onCheckedChange={() => handleCheckboxChange(permission.name)}
                                                                />
                                                                <label htmlFor={`perm-${permission.id}`} className="cursor-pointer text-sm font-medium capitalize text-muted-foreground">
                                                                    {getPermissionActionLabel(permission.name)}
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
                            {errors.permissions && <p className="text-sm font-medium text-red-500">{errors.permissions}</p>}
                        </div>

                        <div className="border-t border-border pt-4 flex gap-3">
                            <Button type="submit" className="shadow-md" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Role'}
                            </Button>
                            <Button asChild variant="ghost">
                                <Link href="/roles">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Roles', href: '/roles' },
        { title: 'Edit', href: '#' },
    ],
};
