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
import { ArrowLeftCircleIcon, Save } from 'lucide-react';

interface MemberUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Role {
    id: number;
    name: string;
}

export default function EditUser({
    user,
    roles = [],
}: {
    user: MemberUser;
    roles: Role[];
}) {
    const { current_tenant, auth } = usePage().props as any;
    // const tenantSlug = current_tenant?.slug || '';
    const currentPathSlug = window.location.pathname.split('/')[1];
    const tenantSlug = current_tenant?.slug || auth?.user?.tenant?.slug || currentPathSlug;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || roles[0]?.name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/${tenantSlug}/settings/users/${user.id}`);
    };

    return (
        <>
            <Head title={`Edit Member - ${user.name}`} />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Edit Member:{' '}
                            <span className="text-blue-600">{user.name}</span>
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Update user account details and role authorization.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-xl border-border"
                    >
                        <Link
                            href={`/${tenantSlug}/settings/users-roles?tab=users`}
                        >
                            <ArrowLeftCircleIcon className="mr-2 h-4 w-4 text-blue-600" />{' '}
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="max-w-2xl space-y-5">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="name"
                                className="text-xs font-semibold"
                            >
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Full Name"
                                required
                                className="h-10 rounded-xl border-border bg-background text-xs"
                            />
                            {errors.name && (
                                <span className="text-xs text-destructive">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="email"
                                className="text-xs font-semibold"
                            >
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="email@company.com"
                                required
                                className="h-10 rounded-xl border-border bg-background text-xs"
                            />
                            {errors.email && (
                                <span className="text-xs text-destructive">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="role"
                                className="text-xs font-semibold"
                            >
                                Role
                            </Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val)}
                            >
                                <SelectTrigger className="h-10 rounded-xl border-border bg-background text-xs">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem
                                            key={r.id}
                                            value={r.name}
                                            className="text-xs"
                                        >
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <span className="text-xs text-destructive">
                                    {errors.role}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                            <div>
                                <Label className="text-xs font-bold text-foreground">
                                    Change Password (Optional)
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Leave blank if you do not want to change the
                                    password.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="password"
                                        className="text-[11px] font-semibold"
                                    >
                                        New Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className="h-10 rounded-xl border-border bg-background text-xs"
                                    />
                                    {errors.password && (
                                        <span className="text-xs text-destructive">
                                            {errors.password}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-[11px] font-semibold"
                                    >
                                        Confirm New Password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                        className="h-10 rounded-xl border-border bg-background text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-border pt-4">
                            <Button
                                type="submit"
                                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
                                disabled={processing}
                            >
                                <Save className="h-4 w-4" />
                                {processing ? 'Updating...' : 'Update Member'}
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                className="rounded-xl text-xs"
                            >
                                <Link
                                    href={`/${tenantSlug}/settings/users-roles?tab=users`}
                                >
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'User & Roles', href: '#' },
        { title: 'Edit Member', href: '#' },
    ],
};
