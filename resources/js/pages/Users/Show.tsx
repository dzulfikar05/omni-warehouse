import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftCircleIcon, PencilIcon, ShieldCheck } from 'lucide-react';
import { User } from '@/types';

interface UserWithRoles extends User {
    roles: string[];
}

export default function Show({ user }: { user: UserWithRoles }) {
    return (
        <>
            <Head title={`User Profile - ${user.name}`} />

            <div className="space-y-6 p-4">
                {/* Header Section */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-foreground">
                                User Details
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/users">
                                    <ArrowLeftCircleIcon className="mr-2 h-4 w-4" />
                                    Back
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mx-auto rounded-lg bg-card text-card-foreground p-6 shadow-md border border-border">
                    <div className="max-w-xl space-y-6">
                        {/* Display Name */}
                        <div className="grid gap-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                            <p className="text-lg font-semibold text-foreground">{user.name}</p>
                        </div>

                        {/* Display Email */}
                        <div className="grid gap-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                            <p className="text-lg font-medium text-foreground">{user.email}</p>
                        </div>

                        {/* Display Roles (Baru) */}
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Assigned Roles</Label>
                            <div className="flex flex-wrap gap-2">
                                {user.roles && user.roles.length > 0 ? (
                                    user.roles.map((role, index) => (
                                        <Badge key={index} variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 capitalize">
                                            {role}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm italic text-muted-foreground">No role assigned</span>
                                )}
                            </div>
                        </div>

                        {/* Display Status/Other Info */}
                        <div className="grid gap-1 border-t border-border pt-4">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account Created</Label>
                            <p className="text-sm text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: 'View Details',
            href: '#',
        },
    ],
};
