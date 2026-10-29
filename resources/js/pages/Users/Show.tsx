import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Edit, User as UserIcon, Mail, Shield, Key, Calendar } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

interface UserDetailProps {
    user: {
        id: number;
        name: string;
        email: string;
        created_at: string;
        roles: string[];
        all_permissions: string[];
    };
}

export default function Show({ user }: UserDetailProps) {
    const { t } = useTranslation();

    // Pengaman jika data user belum siap/kosong
    if (!user) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                {t("User data not found.")}
            </div>
        );
    }

    return (
        <>
            <Head title={`User Details - ${user.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={`User Details: ${user.name}`}
                    description={t("View complete information, assigned roles, and permissions.")}
                    renderAction={
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                                <Link href="/users">
                                    <ArrowLeft className="h-4 w-4" /> {t("Back")}
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="h-9 gap-1.5 bg-blue-600 text-white shadow-md hover:bg-blue-700 text-xs">
                                <Link href={`/users/${user.id}/edit`}>
                                    <Edit className="h-3.5 w-3.5" /> {t("Edit User")}
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Informasi Utama */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
                            {t("Account Information")}
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{t("Full Name")}</p>
                                    <p className="text-sm font-medium">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{t("Email Address")}</p>
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{t("Created At")}</p>
                                    <p className="text-sm font-medium">
                                        {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Peran & Hak Akses */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
                            {t("Roles & Permissions")}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5" /> {t("Assigned Roles")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role, index) => (
                                            <span key={index} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                                                {role}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Key className="h-3.5 w-3.5" /> {t("Direct & Inherited Permissions")}
                                </p>
                                <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 rounded-lg bg-muted/30 border border-border">
                                    {user.all_permissions && user.all_permissions.length > 0 ? (
                                        user.all_permissions.map((permission, index) => (
                                            <span key={index} className="px-2 py-0.5 bg-background text-foreground text-[11px] rounded border border-border">
                                                {permission}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground p-1">-</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: "Users Management", href: '/users' },
        { title: "User Details", href: '#' },
    ],
};