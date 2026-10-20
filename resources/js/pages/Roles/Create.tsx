import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

interface Permission {
    id: number;
    name: string;
}

export default function Create({ permissions = [] }: { permissions: Permission[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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
        post('/roles');
    };

    return (
        <>
            <Head title="Create Central Role" />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title="Create Central Role"
                    description="Define a new administrative role and configure detailed system access capabilities."
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/roles">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <form onSubmit={submit}>
                        <div className="space-y-6 p-6 border-b border-border">
                            <div className="max-w-xl space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold">Role Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Finance Administrator"
                                    className="h-9 text-xs"
                                />
                                {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Assign Permissions ({data.permissions.length} selected)
                                </Label>

                                <div className="space-y-3">
                                    {Object.entries(groupedPermissions).map(([groupName, perms]) => {
                                        const isExpanded = !!openGroups[groupName];
                                        const isAllGroupChecked = perms.every((p) => data.permissions.includes(p.name));

                                        return (
                                            <div key={groupName} className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                                                <div className="flex items-center justify-between bg-muted/40 p-3">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleAccordion(groupName)}
                                                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                                                        >
                                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </button>
                                                        <h3 className="text-xs font-bold text-foreground capitalize">
                                                            {groupName.replace(/_/g, ' ')}
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center space-x-2 rounded-md border border-border bg-background px-2.5 py-1">
                                                        <Checkbox
                                                            id={`all-${groupName}`}
                                                            checked={isAllGroupChecked}
                                                            onCheckedChange={(checked) => toggleGroup(groupName, !!checked)}
                                                        />
                                                        <label htmlFor={`all-${groupName}`} className="cursor-pointer text-[10px] font-bold text-muted-foreground uppercase">
                                                            Check All
                                                        </label>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="grid grid-cols-1 gap-2.5 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
                                                        {perms.map((permission) => {
                                                            const isChecked = data.permissions.includes(permission.name);
                                                            return (
                                                                <div
                                                                    key={permission.id}
                                                                    className={`flex items-center space-x-2.5 rounded-lg border p-2.5 transition ${
                                                                        isChecked ? 'border-blue-300 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20' : 'border-border/60 hover:bg-muted/30'
                                                                    }`}
                                                                >
                                                                    <Checkbox
                                                                        id={`perm-${permission.id}`}
                                                                        checked={isChecked}
                                                                        onCheckedChange={() => handleCheckboxChange(permission.name)}
                                                                    />
                                                                    <label htmlFor={`perm-${permission.id}`} className="cursor-pointer text-xs font-medium text-foreground capitalize">
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
                                {errors.permissions && <p className="text-[11px] text-red-500">{errors.permissions}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 bg-muted/30 p-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={processing}
                                onClick={() => reset()}
                                className="h-9 gap-1.5 border-border text-xs"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700 text-xs"
                            >
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? 'Saving...' : 'Save Role'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Roles Management', href: '/roles' },
        { title: 'Create Role', href: '#' },
    ],
};
