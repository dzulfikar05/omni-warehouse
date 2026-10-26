import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Edit, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/language-context';
import { usePermission } from '@/utils/permission';

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
    const { t } = useTranslation();
    const { can } = usePermission();

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

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={`Role Details: ${role.name}`}
                    description={t("Viewing Central Admin privileges mapped to this role.")}
                    renderAction={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                                <Link href="/roles">
                                    <ArrowLeft className="h-4 w-4" /> {t("Back")}</Link>
                            </Button>
                            {can('central.roles.edit') && (
                                <Button asChild size="sm" className="h-9 gap-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs shadow-md">
                                    <Link href={`/roles/${role.id}/edit`}>
                                        <Edit className="h-3.5 w-3.5" /> {t("Edit Role")}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                    <div className="grid gap-1 border-b border-border pb-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Role Name")}</span>
                        <p className="text-xl font-bold text-foreground capitalize">{role.name}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                {t("Attached Permissions (")}{role.permissions?.length || 0}{t(")")}</span>
                        </div>

                        {Object.keys(groupedPermissions).length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                                    <div key={groupName} className="rounded-xl border border-border bg-muted/30 p-4">
                                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/60 pb-2 capitalize">
                                            {groupName.replace(/_/g, ' ')}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {perms.map((perm) => (
                                                <Badge
                                                    key={perm.id}
                                                    variant="outline"
                                                    className="bg-background border-border text-foreground font-medium capitalize text-[11px] px-2.5 py-1"
                                                >
                                                    {getPermissionActionLabel(perm.name)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                                <p className="text-xs text-muted-foreground italic">{t("No permissions attached to this role.")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: "Roles Management", href: '/roles' },
        { title: "View Details", href: '#' },
    ],
};
