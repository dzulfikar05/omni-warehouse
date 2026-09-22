import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/password-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeftCircleIcon, UserPlus } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

export default function CreateUser({ roles = [] }: { roles: Role[] }) {
    const { current_tenant, auth } = usePage().props as any;
    // const tenantSlug = current_tenant?.slug || '';

    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;


    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0]?.name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${tenantSlug}/settings/users`);
    };

    return (
        <>
            <Head title="Invite New Member" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between text-card-foreground">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Add New Team Member</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Create an operational account for this tenant workspace.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl border-border">
                        <Link href={`/${tenantSlug}/settings/users-roles?tab=users`}>
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" /> Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground">
                    <form onSubmit={submit} className="max-w-2xl space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Wahyu Pratama"
                                required
                                className="h-10 text-xs border-border bg-background rounded-xl"
                            />
                            {errors.name && (
                                <span className="text-xs text-destructive">{errors.name}</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="wahyu@company.com"
                                required
                                className="h-10 text-xs border-border bg-background rounded-xl"
                            />
                            {errors.email && (
                                <span className="text-xs text-destructive">{errors.email}</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="role" className="text-xs font-semibold">
                                Assign Role
                            </Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val)}
                            >
                                <SelectTrigger className="h-10 text-xs border-border bg-background rounded-xl">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name} className="text-xs">
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <span className="text-xs text-destructive">{errors.role}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold">
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                                {errors.password && (
                                    <span className="text-xs text-destructive">{errors.password}</span>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-10 text-xs border-border bg-background rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2"
                                disabled={processing}
                            >
                                <UserPlus className="h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Member'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
        { title: 'Add Member', href: '#' },
    ],
};
