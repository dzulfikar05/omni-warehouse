import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';import { useTranslation } from '@/context/language-context';


interface Role {
    id: number;
    name: string;
}

export default function Create({ roles }: { roles: Role[] }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <>
            <Head title={t("Create New Central User")} />

            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    title={t("Create New Central User")}
                    description={t("Add a new administrator account to manage central system platform operations.")}
                    renderAction={
                        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border text-xs">
                            <Link href="/users">
                                <ArrowLeft className="h-4 w-4" /> {t("Back")}</Link>
                        </Button>
                    }
                />

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <form onSubmit={submit}>
                        <div className="space-y-6 p-6 border-b border-border">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-semibold">{t("Name")}{' '}<span className="text-red-500">{t("*")}</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t("Full Name")}
                                        className="h-9 text-xs"
                                    />
                                    {errors.name && <span className="text-[11px] text-red-500">{errors.name}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold">{t("Email Address")}{' '}<span className="text-red-500">{t("*")}</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t("admin@example.com")}
                                        className="h-9 text-xs"
                                    />
                                    {errors.email && <span className="text-[11px] text-red-500">{errors.email}</span>}
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="role" className="text-xs font-semibold">{t("Assigned System Role")}{' '}<span className="text-red-500">{t("*")}</span></Label>
                                    <Select onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger className="h-9 w-full text-xs">
                                            <SelectValue placeholder={t("-- Select Role --")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name} className="text-xs">
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <span className="text-[11px] text-red-500">{errors.role}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-semibold">{t("Password")}{' '}<span className="text-red-500">{t("*")}</span></Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={t("••••••••")}
                                        className="h-9 text-xs"
                                    />
                                    {errors.password && <span className="text-[11px] text-red-500">{errors.password}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password_confirmation" className="text-xs font-semibold">{t("Confirm Password")}{' '}<span className="text-red-500">{t("*")}</span></Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder={t("••••••••")}
                                        className="h-9 text-xs"
                                    />
                                </div>
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
                                <RotateCcw className="h-3.5 w-3.5" /> {t("Reset")}</Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 bg-blue-600 text-white shadow-md hover:bg-blue-700"
                            >
                                <Save className="mr-1.5 h-4 w-4" /> {processing ? t("Saving...") : t("Save User")}
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
        { title: "Users Management", href: '/users' },
        { title: "Create User", href: '#' },
    ],
};
