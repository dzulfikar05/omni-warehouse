import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, KeyRound, Mail } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/context/language-context';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t("Forgot password")} />

            {/* Container Outer dengan Background Soft Blue Glow */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 p-4 font-sans overflow-hidden transition-colors duration-300 dark:bg-slate-950">

                {/* Back Button ke Login */}
                <Link
                    href={login()}
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {t("Back to Login")}
                </Link>

                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none dark:bg-blue-600/10" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none dark:bg-blue-500/10" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50">

                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Title Section */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t("Forgot Password?")}
                        </h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            {t("No worries. Enter your registered email address and we will send you a link to reset your password.")}
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3 text-center text-xs font-medium text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {status}
                        </div>
                    )}

                    <Form {...email.form()} className="flex flex-col gap-5">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            {t("Email address")}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder={t("admin@naratel.com")}
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-sm text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-950/50"
                                        disabled={processing}
                                        data-test="email-password-reset-link-button"
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <KeyRound className="h-4 w-4" />
                                                {t("Email Password Reset Link")}
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

ForgotPassword.layout = (page: React.ReactNode) => page;
