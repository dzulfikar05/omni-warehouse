import { Form, Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { ArrowLeft, ArrowRight, Lock, User } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Admin Portal Login" />

            {/* Container Outer dengan Background Soft Blue Glow */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 p-4 font-sans overflow-hidden">
                {/* Back Button di Pojok Kiri Atas */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-md active:scale-95"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600" />
                    Back to Home
                </Link>

                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Title Section */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            OmniWarehouse Admin Login
                        </h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 px-2">
                            Access central administration console, system settings, and tenant management.
                        </p>
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    {/* Email Field */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                            <User className="h-3.5 w-3.5 text-blue-600" />
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="admin@omniwarehouse.com"
                                                className="h-11 border-slate-200/80 bg-slate-50/50 pl-3 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                                <Lock className="h-3.5 w-3.5 text-blue-600" />
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••••••••••"
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Sign In to Admin Console
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>

                                {/* {canRegister && (
                                    <div className="mt-2 text-center text-xs text-slate-500">
                                        Don't have an account?{' '}
                                        <TextLink href={register()} tabIndex={5} className="font-semibold text-blue-600 hover:underline">
                                            Sign up
                                        </TextLink>
                                    </div>
                                )} */}
                            </>
                        )}
                    </Form>

                    {status && (
                        <div className="mt-4 text-center text-xs font-medium text-emerald-600 bg-emerald-50 py-2 rounded-lg border border-emerald-200/60">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Login.layout = (page: React.ReactNode) => page;
