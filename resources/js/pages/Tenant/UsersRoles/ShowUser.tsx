import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftCircleIcon, PencilIcon, Mail, Shield, Calendar, Globe } from 'lucide-react';

interface MemberUser {
    id: number;
    name: string;
    email: string;
    initials: string;
    role: string;
    status: string;
    created_at?: string;
    last_login_at?: string;
    ip_address?: string;
}

export default function ShowUser({ user }: { user: MemberUser }) {
    const { current_tenant, auth } = usePage().props as any;
    // const tenantSlug = current_tenant?.slug || '';
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    return (
        <>
            <Head title={`Member Details - ${user.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Team Member Profile</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            View member credentials, assigned role, and activity logs.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="rounded-xl border-border">
                            <Link href={`/${tenantSlug}/settings/users-roles?tab=users`}>
                                <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 rounded-xl">
                            <Link href={`/${tenantSlug}/settings/users/${user.id}/edit`}>
                                <PencilIcon className="mr-2 h-3.5 w-3.5" /> Edit Profile
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 text-card-foreground">
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-xl border border-blue-200 dark:border-blue-800 shadow-xs">
                            {user.initials || user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-foreground">{user.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 text-xs font-semibold">
                                    {user.role || 'Member'}
                                </Badge>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                                    user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {user.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
                                    <p className="font-semibold text-foreground text-xs mt-0.5">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Assigned Role</Label>
                                    <p className="font-semibold text-foreground text-xs mt-0.5">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
                                <Globe className="h-4 w-4 text-blue-600" />
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Last Login & Session</Label>
                                    <p className="font-semibold text-foreground text-xs mt-0.5">{user.last_login_at || 'Never'}</p>
                                    <p className="text-[10px] text-muted-foreground">{user.ip_address || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Joined Date</Label>
                                    <p className="font-semibold text-foreground text-xs mt-0.5">{user.created_at || 'Recently'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ShowUser.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
        { title: 'Member Profile', href: '#' },
    ],
};
