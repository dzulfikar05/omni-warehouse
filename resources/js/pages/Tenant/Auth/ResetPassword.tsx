import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/context/language-context';

type TenantProps = {
    id: number;
    name: string;
    slug: string;
    logo?: string;
};

type Props = {
    token: string;
    email: string;
    tenant?: TenantProps;
};

export default function TenantResetPassword({ token, email, tenant: propTenant }: Props) {
    const { t } = useTranslation();
    const { current_tenant } = usePage<{ current_tenant?: TenantProps }>().props;
    const activeTenant = propTenant || current_tenant;

    const tenantDisplayName = activeTenant?.name || 'Tenant';
    const tenantSlug = activeTenant?.slug || 'demo';

    return (
        <>
            <Head title={`${t("Set New Password")} - ${tenantDisplayName}`} />

            <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 p-4 font-sans overflow-hidden transition-colors duration-300 dark:bg-slate-950">

                {/* Background Decorative Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none dark:bg-blue-600/10" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none dark:bg-blue-500/10" />

                {/* Main Card */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50">

                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t("Set New Password")}
                        </h1>
                        <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {tenantDisplayName}                             {t('Workspace')}
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            {t("Please enter your new secure password to restore access to your account.")}
                        </p>
                    </div>

                    <Form
                        action={`/${tenantSlug}/reset-password`}
                        method="post"
                        transform={(data) => ({ ...data, token, email })}
                        resetOnSuccess={['password', 'password_confirmation']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    {/* Email Field (Read Only) */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            {t("Account Email")}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={email}
                                            readOnly
                                            className="h-11 border-slate-200/80 bg-slate-100/70 text-sm text-slate-600 cursor-not-allowed dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            {t("New Password")}
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoFocus
                                            autoComplete="new-password"
                                            placeholder={t("••••••••••••••••")}
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-sm text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            {t("Confirm New Password")}
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder={t("••••••••••••••••")}
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-sm text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-950/50"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <KeyRound className="h-4 w-4" />
                                                {t("Reset Password")}
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

TenantResetPassword.layout = (page: React.ReactNode) => page;
